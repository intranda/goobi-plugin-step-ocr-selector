package de.intranda.goobi.plugins.ocrselector;

import com.google.gson.Gson;

import spark.Service;

public class Routes {
    private static Gson gson = new Gson();

    public static void initRoutes(Service http) {
        http.path("/ocrselector", () -> {
            http.get("/:processid/dd", Handlers.getDigitalDoc, gson::toJson);
            http.post("/:processid/results", Handlers.saveResults);
            http.get("/:processid/saved", Handlers.getSavedData, gson::toJson);
        });
    }

}
