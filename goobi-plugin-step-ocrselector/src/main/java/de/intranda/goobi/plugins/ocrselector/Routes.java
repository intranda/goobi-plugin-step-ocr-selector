package de.intranda.goobi.plugins.ocrselector;

import com.google.gson.Gson;

import spark.Service;

public class Routes {
    private static Gson gson = new Gson();

    public static void initRoutes(Service http) {
        http.path("/ocrselector", () -> {
            http.get("/dd", Handlers.getDigitalDoc, gson::toJson);
        });
    }

}
