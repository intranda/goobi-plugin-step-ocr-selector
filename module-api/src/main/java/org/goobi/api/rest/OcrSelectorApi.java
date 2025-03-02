package org.goobi.api.rest;


import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import de.intranda.goobi.plugins.ocrselector.SavedData;
import de.sub.goobi.helper.exceptions.DAOException;
import de.sub.goobi.helper.exceptions.SwapException;
import de.sub.goobi.metadaten.MetadatenImagesHelper;
import de.sub.goobi.persistence.managers.ProcessManager;
import jakarta.ws.rs.*;
import lombok.extern.log4j.Log4j2;
import org.goobi.beans.Masterpiece;
import org.goobi.beans.Masterpieceproperty;
import org.goobi.beans.Process;
import org.goobi.beans.Processproperty;
import ugh.dl.DigitalDocument;
import ugh.exceptions.PreferencesException;
import ugh.exceptions.ReadException;
import ugh.exceptions.TypeNotAllowedForParentException;
import ugh.fileformats.slimjson.SlimDigitalDocument;

import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.lang.reflect.Type;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;

@Log4j2
@Path("/plugins/ocrselector")
public class OcrSelectorApi {
    private static Gson gson = new Gson();
    private static Type mapType = new TypeToken<Map<String, String>>() {}.getType();

    @GET
    @Path("/{processid}/dd")
    @Produces({ MediaType.APPLICATION_JSON })
    public SlimDigitalDocument getDigitalDoc(@PathParam("processid") int processid) throws ReadException, SwapException, IOException, PreferencesException, DAOException, TypeNotAllowedForParentException {
        Process p = ProcessManager.getProcessById(processid);
        DigitalDocument dd = p.readMetadataFile().getDigitalDocument();
        MetadatenImagesHelper mih = new MetadatenImagesHelper(p.getRegelsatz().getPreferences(), dd);
        mih.createPagination(p, null);
        final SlimDigitalDocument sdd = SlimDigitalDocument.fromDigitalDocument(dd, p.getRegelsatz().getPreferences());
        return sdd;
    }

    @POST
    @Path("/{processid}/results")
    @Produces({ MediaType.APPLICATION_JSON })
    public Response saveResults(@PathParam("processid") int processid, InputStream body) throws ReadException, SwapException, IOException, PreferencesException, DAOException, TypeNotAllowedForParentException {
        Process p = ProcessManager.getProcessById(processid);
        Files.copy(body, Paths.get(p.getProcessDataDirectory()).resolve("ocrPages.json"), StandardCopyOption.REPLACE_EXISTING);
        return Response.ok().build();
    }

    @GET
    @Path("/{processid}/saved")
    @Produces({ MediaType.APPLICATION_JSON })
    public SavedData getSavedData(@PathParam("processid") int processid) throws ReadException, SwapException, IOException, PreferencesException, DAOException, TypeNotAllowedForParentException {
        Process p = ProcessManager.getProcessById(processid);
        String defaultValue = null;
        for (Processproperty prop : p.getEigenschaften()) {
            if (prop.getTitel().equalsIgnoreCase("schrifttyp")) {
                defaultValue = prop.getWert();
            }
        }
        if (defaultValue == null) {
            for (Masterpiece masterpiece : p.getWerkstuecke()) {
                for (Masterpieceproperty property : masterpiece.getEigenschaften()) {
                    if (property.getTitel().equalsIgnoreCase("schrifttyp")) {
                        defaultValue = property.getWert();
                    }
                }
            }
        }
        SavedData data = new SavedData();
        data.setDefaultValue(defaultValue);
        java.nio.file.Path savedFile = Paths.get(p.getProcessDataDirectory()).resolve("ocrPages.json");
        if (Files.exists(savedFile)) {
            try (InputStream in = Files.newInputStream(savedFile); InputStreamReader json = new InputStreamReader(in)) {
                Map<String, String> savedData = gson.fromJson(json, mapType);
                data.setSavedData(savedData);
            }
        }
        return data;
    }
}
