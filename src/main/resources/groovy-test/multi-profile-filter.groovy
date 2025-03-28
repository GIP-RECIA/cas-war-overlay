import org.ldaptive.*
import org.springframework.context.*
import java.util.regex.Matcher;
import java.util.regex.Pattern;

def run(Object[] args) {
    def (filter,parameters,applicationContext,logger) = args
    logger.info("Parameters passed to groovy script are : "+parameters.toString())

    // Regex
    String regex = 'AAF(.*)'
    Pattern pattern = Pattern.compile(regex);

    // Construct filter
    String finalFilter = ""
    int filterNumber = 0
    for(value in parameters.get("FrEduCtRefId")){
        Matcher matcher = pattern.matcher(value);
        if (matcher.find()) {
            finalFilter += '(ENTPersonJointure=AC-RENNES$'+matcher.group(1)+')'
            filterNumber += 1
        }
    }
    if(filterNumber > 1){
        finalFilter = "(|" + finalFilter+")";
    }

    logger.info("Configuring LDAP filter to be "+finalFilter)
    filter.setFilter(finalFilter)
}