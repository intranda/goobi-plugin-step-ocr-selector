package de.intranda.goobi.plugins.ocrselector;

import java.util.Map;

import lombok.Data;

@Data
public class SavedData {
    private Map<String, String> savedData;
    private String defaultValue;
}
