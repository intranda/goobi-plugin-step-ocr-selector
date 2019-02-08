package de.intranda.goobi.plugins.ocrselector;

import java.nio.file.Path;
import java.nio.file.Paths;

import org.goobi.beans.Process;

import com.google.gson.Gson;

import de.sub.goobi.metadaten.MetadatenImagesHelper;
import de.sub.goobi.persistence.managers.ProcessManager;
import spark.Route;
import ugh.dl.DigitalDocument;
import ugh.fileformats.slimjson.SlimDigitalDocument;

public class Handlers {
    private static Gson gson = new Gson();
    public static Route getDigitalDoc = (req, res) -> {
        Process p = ProcessManager.getProcessById(Integer.parseInt(req.params("processid")));
        Path xmlPath = Paths.get(p.getProcessDataDirectory(), "meta.xml");
        DigitalDocument dd = p.readMetadataFile().getDigitalDocument();
        MetadatenImagesHelper mih = new MetadatenImagesHelper(p.getRegelsatz().getPreferences(), dd);
        mih.createPagination(p, null);
        res.header("content-type", "application/json");
        final SlimDigitalDocument sdd = SlimDigitalDocument.fromDigitalDocument(dd, p.getRegelsatz().getPreferences());
        return sdd;
    };
}
