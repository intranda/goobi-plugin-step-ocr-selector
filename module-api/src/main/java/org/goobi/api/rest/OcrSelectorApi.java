package org.goobi.api.rest;


import de.sub.goobi.helper.exceptions.DAOException;
import de.sub.goobi.helper.exceptions.SwapException;
import de.sub.goobi.metadaten.MetadatenImagesHelper;
import de.sub.goobi.persistence.managers.ProcessManager;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.log4j.Log4j2;
import org.goobi.beans.Process;
import ugh.dl.DigitalDocument;
import ugh.exceptions.PreferencesException;
import ugh.exceptions.ReadException;
import ugh.exceptions.TypeNotAllowedForParentException;
import ugh.fileformats.slimjson.SlimDigitalDocument;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.io.IOException;

@Log4j2
@Path("/plugins/ocrselector")
public class OcrSelectorApi {
    @GET
    @Path("/{processid}/dd")
    @Operation(summary = "Serves a process resource", description = "Serves a process resource consisting of a process name, id, project name")
    @ApiResponse(responseCode = "200", description = "OK")
    @ApiResponse(responseCode = "400", description = "Bad request")
    @ApiResponse(responseCode = "404", description = "Process not found")
    @ApiResponse(responseCode = "500", description = "Internal error")
    @Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
    @Tag(name = "process")
    public SlimDigitalDocument getProcessData(@PathParam("processid") String processid) throws ReadException, SwapException, IOException, PreferencesException, DAOException, TypeNotAllowedForParentException {
        Process p = ProcessManager.getProcessById(Integer.parseInt(processid));
        DigitalDocument dd = p.readMetadataFile().getDigitalDocument();
        MetadatenImagesHelper mih = new MetadatenImagesHelper(p.getRegelsatz().getPreferences(), dd);
        mih.createPagination(p, null);
        final SlimDigitalDocument sdd = SlimDigitalDocument.fromDigitalDocument(dd, p.getRegelsatz().getPreferences());
        return sdd;
    }

    @Path("/help")
    public Response help() {
        return Response.status(200).build();
    }
}
