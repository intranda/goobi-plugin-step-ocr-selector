package de.intranda.goobi.plugins.ocrselector;

import static org.junit.Assert.*;

import java.nio.file.Path;
import java.nio.file.Paths;

import org.apache.commons.lang3.StringUtils;
import org.junit.Test;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import ugh.dl.Prefs;
import ugh.exceptions.PreferencesException;
import ugh.exceptions.ReadException;
import ugh.fileformats.mets.MetsMods;
import ugh.fileformats.slimjson.SlimDigitalDocument;

public class HandlersTest {

    Path meta1 = Paths.get("src/test/resources/meta_2413.xml");
    Path meta2 = Paths.get("src/test/resources/meta_2416.xml");
    Path ruleset = Paths.get("src/test/resources/ruleset.xml");
    Path ruleset2 = Paths.get("src/test/resources/ruleset_theses.xml");
    ObjectMapper mapper = new ObjectMapper();
    
    @Test
    public void testSerializeDigitalDocument1() throws PreferencesException, ReadException, JsonProcessingException {
        Prefs prefs = new Prefs();
        prefs.loadPrefs(ruleset.toAbsolutePath().toString());
        
        MetsMods metsDoc = new MetsMods(prefs);
        metsDoc.read(meta1.toAbsolutePath().toString());
        
        SlimDigitalDocument slimDoc = SlimDigitalDocument.fromDigitalDocument(metsDoc.getDigitalDocument(), prefs);
        assertFalse(slimDoc.getDsMap().isEmpty());
        
        String string = mapper.writeValueAsString(slimDoc);
        assertTrue(StringUtils.isNotEmpty(string));
    }

    @Test
    public void testSerializeDigitalDocument2() throws PreferencesException, ReadException, JsonProcessingException {
        Prefs prefs = new Prefs();
        prefs.loadPrefs(ruleset2.toAbsolutePath().toString());
        
        MetsMods metsDoc = new MetsMods(prefs);
        metsDoc.read(meta2.toAbsolutePath().toString());
        
        SlimDigitalDocument slimDoc = SlimDigitalDocument.fromDigitalDocument(metsDoc.getDigitalDocument(), prefs);
        assertFalse(slimDoc.getDsMap().isEmpty());
        
        String string = mapper.writeValueAsString(slimDoc);
        assertTrue(StringUtils.isNotEmpty(string));
        System.out.println(string);
    }
}
