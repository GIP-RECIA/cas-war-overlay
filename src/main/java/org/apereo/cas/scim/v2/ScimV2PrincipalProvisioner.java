package org.apereo.cas.scim.v2;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import de.captaingoldfish.scim.sdk.common.constants.enums.PatchOp;
import de.captaingoldfish.scim.sdk.common.exceptions.InternalServerException;
import de.captaingoldfish.scim.sdk.common.resources.Group;
import de.captaingoldfish.scim.sdk.common.resources.complex.Meta;
import de.captaingoldfish.scim.sdk.common.resources.complex.Name;
import de.captaingoldfish.scim.sdk.common.resources.multicomplex.Email;
import org.apereo.cas.authentication.Authentication;
import org.apereo.cas.authentication.Credential;
import org.apereo.cas.authentication.principal.Principal;
import org.apereo.cas.authentication.principal.PrincipalProvisioner;
import org.apereo.cas.configuration.model.support.custom.CasCustomProperties;
import org.apereo.cas.configuration.model.support.scim.ScimProperties;
import org.apereo.cas.services.RegisteredService;
import org.apereo.cas.services.RegisteredServiceProperty.RegisteredServiceProperties;
import org.apereo.cas.util.CollectionUtils;
import org.apereo.cas.util.LoggingUtils;

import de.captaingoldfish.scim.sdk.client.ScimClientConfig;
import de.captaingoldfish.scim.sdk.client.ScimRequestBuilder;
import de.captaingoldfish.scim.sdk.common.constants.EndpointPaths;
import de.captaingoldfish.scim.sdk.common.resources.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import lombok.val;
import org.apache.commons.lang3.StringUtils;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * This is {@link ScimV2PrincipalProvisioner}.
 *
 * @author Misagh Moayyed
 * @since 5.1.0
 */
@Slf4j
@RequiredArgsConstructor
public class ScimV2PrincipalProvisioner implements PrincipalProvisioner {

    private final ScimProperties scimProperties;
    private final CasCustomProperties customProperties;

    @Override
    public boolean provision(final Principal principal, final Credential credential) {
        return provision(Optional.empty(), principal);
    }

    @Override
    public boolean provision(final Authentication auth, final Credential credential,
                             final RegisteredService registeredService) {
        val principal = auth.getPrincipal();
        return provision(Optional.ofNullable(registeredService), principal);
    }

    /**
     * Provision a user for a given service
     * Also creates all necessary establishments, classes and group members
     * @param registeredService The service demanding SCIM provisionning
     * @param principal The user from cas
     */
    private boolean provision(final Optional<RegisteredService> registeredService,
                              final Principal principal) {
        try {
            LOGGER.info("Attempting to execute provisioning ops for [{}]", principal.getId());
            val scimService = getScimService(registeredService);
            val regex = customProperties.getProperties().get("scim.regex-etab-class");
            val groupsAttribute = customProperties.getProperties().get("scim.groups-attribute");
            val principalAttribute = customProperties.getProperties().get("scim.principal-attribute");
            val profileAttribute = customProperties.getProperties().get("scim.profile-attribute");
            val teacherAttributeValue = customProperties.getProperties().get("scim.teacher-attribute-value");

            // 0.1 Get all etabs and classes of user in LDAP
            LOGGER.debug("Finding classes in attribute isMemberOf for user [{}]", principal.getId());
            Map<String,Set<String>> classesByEtab = new HashMap<>();
            for(val isMemberOf : principal.getAttributes().get(groupsAttribute)){
                Pattern pattern = Pattern.compile(regex);
                Matcher matcher = pattern.matcher((String) isMemberOf);
                if (matcher.find()) {
                    String codeEtab = matcher.group(1);
                    String nomClasse = matcher.group(2);
                    LOGGER.debug("Class [{}] found for etab [{}] in attribute [{}]", nomClasse, codeEtab, isMemberOf);
                    if(!classesByEtab.containsKey(codeEtab)){
                        classesByEtab.put(codeEtab, new HashSet<>());
                    }
                    classesByEtab.get(codeEtab).add(codeEtab+"/"+nomClasse);
                }
            }

            // All classes of user in LDAP and in SCIM (useful for later)
            Set<String> classesOfUserInSCIM = new HashSet<>();
            Set<String> classesOfUserInLDAP = new HashSet<>();
            User user = null;
            String userId = null;
            val userName = principal.getAttributes().get(principalAttribute).getFirst();

            // 1.1 Check if user exists
            LOGGER.debug("GET /Users for user [{}]", userName);
            val responseGetUser = scimService.list(User.class, EndpointPaths.USERS)
                    .filter("userName eq \"" + userName + "\"")
                    .get()
                    .sendRequest();
            LOGGER.debug("Response body is [{}]", responseGetUser.getResponseBody());
            if(responseGetUser.isSuccess() && responseGetUser.isValidScimResponse()){
                LOGGER.debug("GET /Users for user [{}] returned [{}] value", userName, responseGetUser.getResource().getTotalResults());
            } else {
                throw new InternalServerException("An error occurred on GET /Users for user "+userName);
            }

            // 1.2 Create or update user
            if (responseGetUser.getResource().getTotalResults() > 0) {
                userId = responseGetUser.getResource().getListedResources().getFirst().getId().get();
                user = responseGetUser.getResource().getListedResources().getFirst();
                LOGGER.debug("Collecting user [{}] with id [{}]", userName, userId);
            } else {
                LOGGER.debug("Creating user [{}]", userName);
                val userResource = mapUserResource(principal, principalAttribute, profileAttribute, teacherAttributeValue);
                LOGGER.trace("Creating user resource [{}]", userResource);
                val responsePostUser = getScimService(registeredService)
                        .create(User.class, EndpointPaths.USERS)
                        .setResource(userResource)
                        .sendRequest();
                LOGGER.debug("Response body is [{}]", responsePostUser.getResponseBody());
                if(responsePostUser.isSuccess() && responsePostUser.isValidScimResponse()){
                    userId = responsePostUser.getResource().getId().get();
                    user = responsePostUser.getResource();
                    LOGGER.debug("User [{}] created with id [{}]", userName, userId);
                } else {
                    throw new InternalServerException("An error occurred on POST /Users for user "+userName);
                }
            }

            // 2.1 For each user establishment, check if establishment exists
            for(val currentEtab: classesByEtab.keySet()) {
                LOGGER.debug("Check if establishment [{}] exists", currentEtab);
                LOGGER.debug("GET /Groups for establishment [{}]", currentEtab);
                val responseGetEtab = scimService.list(Group.class, EndpointPaths.GROUPS)
                        .filter("displayName eq \"" + currentEtab + "\"")
                        .get()
                        .sendRequest();
                LOGGER.debug("Response body is [{}]", responseGetEtab.getResponseBody());
                if(responseGetEtab.isSuccess() && responseGetEtab.isValidScimResponse()){
                    LOGGER.debug("GET /Groups for [{}] returned [{}] establishment", currentEtab, responseGetEtab.getResource().getTotalResults());
                } else {
                    throw new InternalServerException("An error occurred on GET /Groups for etab "+currentEtab);
                }

                // 2.2 Create or update establishment
                String etabId = null;
                if (responseGetEtab.getResource().getTotalResults() == 0) {
                    val etab = mapEstablishmentResource(currentEtab);
                    LOGGER.debug("Creating establishment [{}]", etab);
                    val responsePostEtab = getScimService(registeredService)
                            .create(Group.class, EndpointPaths.GROUPS)
                            .setResource(etab)
                            .sendRequest();
                    LOGGER.debug("Response body is [{}]", responsePostEtab.getResponseBody());
                    if(responsePostEtab.isSuccess() && responsePostEtab.isValidScimResponse()){
                        etabId = responsePostEtab.getResource().getId().get();
                        LOGGER.debug("Establishment [{}] created with id [{}]", currentEtab, etabId);
                    } else {
                        throw new InternalServerException("An error occurred on POST /Groups for etab "+currentEtab);
                    }
                } else {
                    etabId = responseGetEtab.getResource().getListedResources().getFirst().getId().get();
                    LOGGER.debug("Establishment [{}] collected with id [{}]", currentEtab, etabId);
                }

                // 3.1 For each user class, check if class exists
                for(val userClass : classesByEtab.get(currentEtab)){
                    LOGGER.debug("GET /Groups for class [{}]", userClass);
                    val responseGetClass = scimService.list(Group.class, EndpointPaths.GROUPS)
                            .filter("displayName eq \"" + userClass + "\"")
                            .get()
                            .sendRequest();
                    LOGGER.debug("Response body is [{}]", responseGetClass.getResponseBody());
                    if(responseGetClass.isSuccess() && responseGetClass.isValidScimResponse()){
                        LOGGER.debug("GET /Groups for [{}] returned [{}] class", userClass, responseGetClass.getResource().getTotalResults());
                    } else {
                        throw new InternalServerException("An error occurred on GET /Groups for class "+userClass);
                    }

                    // 3.2 Create or update class
                    String classId = null;
                    if (responseGetClass.getResource().getTotalResults() == 0) {
                        LOGGER.debug("No class [{}] was found", userClass);
                        val classResource = mapClassResource(userClass);
                        LOGGER.debug("Creating class [{}]", classResource);
                        val responsePostClass = getScimService(registeredService)
                                .create(Group.class, EndpointPaths.GROUPS)
                                .setResource(classResource)
                                .sendRequest();
                        LOGGER.debug("Response body is [{}]", responsePostClass.getResponseBody());
                        if(responsePostClass.isSuccess() && responsePostClass.isValidScimResponse()){
                            classId = responsePostClass.getResource().getId().get();
                            classesOfUserInLDAP.add(classId);
                            LOGGER.debug("Class [{}] created with id [{}]", userClass, classId);
                        } else {
                            throw new InternalServerException("An error occurred on POST /Groups for class "+userClass);
                        }

                        // 3.3 Add class to establishment group
                        LOGGER.debug("Now adding class [{}] to [{}] members", classId, etabId);
                        ObjectMapper mapper = new ObjectMapper();
                        ObjectNode rootNode = mapper.createObjectNode();
                        rootNode.put("value", classId);
                        val responsePatchEtab = getScimService(registeredService)
                                .patch(Group.class, EndpointPaths.GROUPS, etabId)
                                .addOperation()
                                .op(PatchOp.ADD)
                                .path("members")
                                .valueNode(rootNode)
                                .build()
                                .sendRequest();
                        LOGGER.debug("Response body is [{}]", responsePatchEtab.getResponseBody());
                        if (responsePatchEtab.isSuccess() && responsePatchEtab.isValidScimResponse()) {
                            LOGGER.debug("Class [{}] was successfully added to [{}]", userClass, currentEtab);
                        } else {
                            throw new InternalServerException("An error occurred on PATCH /Groups for etab "+etabId);
                        }
                    } else {
                        classId = responseGetClass.getResource().getListedResources().getFirst().getId().get();
                        LOGGER.debug("Class [{}] collected with id [{}]", userClass, classId);
                        classesOfUserInLDAP.add(classId);
                    }
                }
            }

            // After collecting all classes for all etabs
            // 4.1 User update = remove old classes and add new classes
            // Get all actual classes of user (if new user it will be empty)
            for (val group : user.getGroups()) {
                if (group.get("value").asText().startsWith("cls.")) {
                    classesOfUserInSCIM.add(group.get("value").asText());
                }
            }
            LOGGER.debug("Classes IDS in SCIM (actual) [{}]", classesOfUserInSCIM);
            LOGGER.debug("Classes IDS in LDAP (update) [{}]", classesOfUserInLDAP);
            // First step : add new classes
            for(String clsId : classesOfUserInLDAP){
                if(!classesOfUserInSCIM.contains(clsId)){
                    LOGGER.debug("Adding user [{}] to [{}] members", userId, clsId);
                    ObjectMapper mapper = new ObjectMapper();
                    ObjectNode rootNode = mapper.createObjectNode();
                    rootNode.put("value", userId);
                    val responsePatchEtabAddUserToClass = getScimService(registeredService)
                            .patch(Group.class, EndpointPaths.GROUPS, clsId)
                            .addOperation()
                            .op(PatchOp.ADD)
                            .path("members")
                            .valueNode(rootNode)
                            .build()
                            .sendRequest();
                    LOGGER.debug("Response body is [{}]", responsePatchEtabAddUserToClass.getResponseBody());
                    if (responsePatchEtabAddUserToClass.isSuccess() && responsePatchEtabAddUserToClass.isValidScimResponse()) {
                        LOGGER.debug("User [{}] was successfully added to [{}]", userId, clsId);
                    } else {
                        throw new InternalServerException("An error occurred on PATCH /Groups for class "+clsId);
                    }
                }
            }
            // Second step : remove old classes
            for(String clsId : classesOfUserInSCIM){
                if(!classesOfUserInLDAP.contains(clsId)){
                    LOGGER.debug("Removing user [{}] from [{}] members", userId, clsId);
                    ObjectMapper mapper = new ObjectMapper();
                    ObjectNode rootNode = mapper.createObjectNode();
                    rootNode.put("value", userId);
                    val responsePatchEtabRemoveUserToClass = getScimService(registeredService)
                            .patch(Group.class, EndpointPaths.GROUPS, clsId)
                            .addOperation()
                            .op(PatchOp.REMOVE)
                            .path("members")
                            .valueNode(rootNode)
                            .build()
                            .sendRequest();
                    LOGGER.debug("Response body is [{}]", responsePatchEtabRemoveUserToClass.getResponseBody());
                    if (responsePatchEtabRemoveUserToClass.isSuccess() && responsePatchEtabRemoveUserToClass.isValidScimResponse()) {
                        LOGGER.debug("User [{}] was successfully removed from [{}]", userId, clsId);
                    } else {
                        throw new InternalServerException("An error occurred on PATCH /Groups for class "+clsId);
                    }
                }
            }
            return true;
        } catch (final Exception e) {
            LoggingUtils.error(LOGGER, e);
        }
        return false;
    }

    /**
     * Creates a group object (SCIM)
     * @param displayName The displayName of the establishment
     */
    protected Group mapEstablishmentResource(String displayName){
        // Root object
        val etab = new Group();
        // DisplayName
        etab.setDisplayName(displayName);
        // Schemas
        etab.addSchema("urn:ietf:params:scim:schemas:extension:idruide:education:2.0:Group");
        // Meta
        Meta etabMeta = new Meta();
        etabMeta.setResourceType("Group");
        etab.setMeta(etabMeta);
        // urn:ietf:params:scim:schemas:extension:idruide:education:2.0:Group
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode rootNode = mapper.createObjectNode();
        rootNode.put("educationGroupType", "establishment");
        ObjectNode establishment = mapper.createObjectNode();
        establishment.put("identifier", displayName);
        rootNode.set("establishment", establishment);
        ObjectNode address = mapper.createObjectNode();
        address.put("streetAddress", "");
        address.put("locality", "");
        address.put("postalCode", "");
        address.put("country", "");
        establishment.set("address", address);
        etab.set("urn:ietf:params:scim:schemas:extension:idruide:education:2.0:Group", rootNode);
        return etab;
    }

    /**
     * Creates a group object (SCIM)
     * @param displayName The displayName of the class
     */
    protected Group mapClassResource(String displayName){
        // Root object
        val cls = new Group();
        // DisplayName
        cls.setDisplayName(displayName);
        // Schemas
        cls.addSchema("urn:ietf:params:scim:schemas:extension:idruide:education:2.0:Group");
        // Meta
        Meta clsMeta = new Meta();
        clsMeta.setResourceType("Group");
        cls.setMeta(clsMeta);
        // urn:ietf:params:scim:schemas:extension:idruide:education:2.0:Group
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode rootNode = mapper.createObjectNode();
        rootNode.put("educationGroupType", "class");
        ObjectNode classe = mapper.createObjectNode();
        classe.put("grade", "");
        rootNode.set("class", classe);
        cls.set("urn:ietf:params:scim:schemas:extension:idruide:education:2.0:Group", rootNode);
        return cls;
    }

    /**
     * Creates a user object (SCIM)
     * @param principal The principal returned from cas
     * @param principalAttribute The attribute name used to identify the principal
     */
    protected User mapUserResource(final Principal principal, final String principalAttribute,
                                   final String profileAttribute, final String teacherAttributeValue) throws Exception {
        val user = new User();
        // Custom Schema
        user.addSchema("urn:ietf:params:scim:schemas:extension:idruide:education:2.0:User");
        // Username
        user.setUserName((String) principal.getAttributes().get(principalAttribute).getFirst());
        // Email
        val email = new Email();
        email.setPrimary(Boolean.TRUE);
        email.setValue(getPrincipalAttributeValue(principal, "mail"));
        user.setEmails(CollectionUtils.wrap(email));
        //GivenName et FamilyName
        val name = new Name();
        name.setGivenName(getPrincipalAttributeValue(principal, "givenName"));
        name.setFamilyName(getPrincipalAttributeValue(principal, "sn"));
        user.setName(name);
        // Meta
        if (user.getMeta().isEmpty()) {
            val meta = new Meta();
            meta.setResourceType("User");
            user.setMeta(meta);
        }
        // Active
        user.setActive(true);
        // urn:ietf:params:scim:schemas:extension:idruide:education:2.0:User
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode userType = mapper.createObjectNode();
        if(getPrincipalAttributeValues(principal, profileAttribute).contains(teacherAttributeValue)){
            userType.put("educationUserType", "teacher");
        } else {
            userType.put("educationUserType", "student");
        }
        user.set("urn:ietf:params:scim:schemas:extension:idruide:education:2.0:User", userType);
        return user;
    }

    /**
     * Initialize an http request for a specific service
     * @param givenService The service demanding SCIM provisionning
     */
    protected ScimRequestBuilder getScimService(final Optional<RegisteredService> givenService) {
        val headersMap = new HashMap<String, String>();

        var token = scimProperties.getOauthToken();
        if (givenService.isPresent()) {
            val registeredService = givenService.get();
            if (RegisteredServiceProperties.SCIM_OAUTH_TOKEN.isAssignedTo(registeredService)) {
                token = RegisteredServiceProperties.SCIM_OAUTH_TOKEN.getPropertyValue(registeredService).value();
            }
        }
        if (StringUtils.isNotBlank(token)) {
            headersMap.put("Authorization", "Bearer " + token);
        }

        var username = scimProperties.getUsername();
        var password = scimProperties.getPassword();
        var target = scimProperties.getTarget();

        val scimClientConfigBuilder = ScimClientConfig.builder();
        if (givenService.isPresent()) {
            val registeredService = givenService.get();
            if (RegisteredServiceProperties.SCIM_USERNAME.isAssignedTo(registeredService)) {
                username = RegisteredServiceProperties.SCIM_USERNAME.getPropertyValue(registeredService).value();
            }
            if (RegisteredServiceProperties.SCIM_PASSWORD.isAssignedTo(registeredService)) {
                password = RegisteredServiceProperties.SCIM_PASSWORD.getPropertyValue(registeredService).value();
            }
        }
        if (StringUtils.isNotBlank(username) && StringUtils.isNotBlank(password)) {
            scimClientConfigBuilder.basic(username, password);
        }

        if (givenService.isPresent()) {
            val registeredService = givenService.get();
            if (RegisteredServiceProperties.SCIM_TARGET.isAssignedTo(registeredService)) {
                target = RegisteredServiceProperties.SCIM_TARGET.getPropertyValue(registeredService).value();
            }
        }
        LOGGER.debug("Using SCIM provisioning target [{}]", target);
        val scimClientConfig = scimClientConfigBuilder
            .connectTimeout(5)
            .requestTimeout(5)
            .socketTimeout(5)
            .hostnameVerifier((s, sslSession) -> true)
            .httpHeaders(headersMap)
            .build();
        return new ScimRequestBuilder(target, scimClientConfig);
    }

    /**
     * Gets the attribute value for a given attribute and principal
     * @param principal The principal (from cas)
     * @param attributeName The attribute name
     */
    protected String getPrincipalAttributeValue(final Principal principal,
                                                final String attributeName) {
        val attributes = principal.getAttributes();
        if (attributes.containsKey(attributeName)) {
            return CollectionUtils.toCollection(attributes.get(attributeName)).iterator().next().toString();
        }
        return null;
    }

    /**
     * Gets the attribute values for a given attribute and principal
     * @param principal The principal (from cas)
     * @param attributeName The attribute name
     */
    protected List<String> getPrincipalAttributeValues(final Principal principal,
                                                final String attributeName) {
        val attributes = principal.getAttributes();
        if (attributes.containsKey(attributeName)) {
            return attributes.get(attributeName).stream()
                   .map(element->(String) element)
                   .collect(Collectors.toList());
        }
        return null;
    }
}
