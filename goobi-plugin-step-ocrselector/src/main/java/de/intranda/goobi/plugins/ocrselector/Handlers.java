package de.intranda.goobi.plugins.ocrselector;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.lang.reflect.Type;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;

import org.goobi.beans.Process;
import org.goobi.beans.Processproperty;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import de.sub.goobi.metadaten.MetadatenImagesHelper;
import de.sub.goobi.persistence.managers.ProcessManager;
import spark.Route;
import ugh.dl.DigitalDocument;
import ugh.fileformats.slimjson.SlimDigitalDocument;

public class Handlers {
    private static Gson gson = new Gson();
    private static Type mapType = new TypeToken<Map<String, String>>() {
    }.getType();
    static Route getDigitalDoc = (req, res) -> {
        Process p = ProcessManager.getProcessById(Integer.parseInt(req.params("processid")));
        DigitalDocument dd = p.readMetadataFile().getDigitalDocument();
        MetadatenImagesHelper mih = new MetadatenImagesHelper(p.getRegelsatz().getPreferences(), dd);
        mih.createPagination(p, null);
        res.header("content-type", "application/json");
        final SlimDigitalDocument sdd = SlimDigitalDocument.fromDigitalDocument(dd, p.getRegelsatz().getPreferences());
        return sdd;
    };
    static Route saveResults = (req, res) -> {
        Process p = ProcessManager.getProcessById(Integer.parseInt(req.params("processid")));
        Path ocrDir = Paths.get(p.getOcrDirectory());
        Files.createDirectories(ocrDir);
        Files.copy(req.raw().getInputStream(), ocrDir.resolve("ocrPages.json"), StandardCopyOption.REPLACE_EXISTING);
        return "ok";
    };
    public static Route getSavedData = (req, res) -> {
        Process p = ProcessManager.getProcessById(Integer.parseInt(req.params("processid")));
        String defaultValue = null;
        for (Processproperty prop : p.getEigenschaften()) {
            if (prop.getTitel().equals("Schrifttyp")) {
                defaultValue = prop.getWert();
            }
        }
        SavedData data = new SavedData();
        data.setDefaultValue(defaultValue);
        Path savedFile = Paths.get(p.getOcrDirectory()).resolve("ocrPages.json");
        if (Files.exists(savedFile)) {
            try (InputStream in = Files.newInputStream(savedFile); InputStreamReader json = new InputStreamReader(in)) {
                Map<String, String> savedData = gson.fromJson(json, mapType);
                data.setSavedData(savedData);
            }
        }
        res.header("content-type", "application/json");
        return data;
    };
}
