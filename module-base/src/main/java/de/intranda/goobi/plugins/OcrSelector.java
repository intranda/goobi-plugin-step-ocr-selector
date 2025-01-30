package de.intranda.goobi.plugins;

import lombok.Data;
import lombok.extern.log4j.Log4j;
import net.xeoh.plugins.base.annotations.PluginImplementation;
import org.goobi.beans.Step;
import org.goobi.production.enums.PluginGuiType;
import org.goobi.production.enums.PluginType;
import org.goobi.production.enums.StepReturnValue;
import org.goobi.production.plugin.interfaces.IGuiPlugin;
import org.goobi.production.plugin.interfaces.IStepPlugin;

import java.util.HashMap;

@Log4j
@Data
@PluginImplementation
public class OcrSelector implements IGuiPlugin, IStepPlugin {
    private Step step;
    private String returnPath;
    private String title = "intranda_step_ocrselector";

    @Override
    public String cancel() {
        return "/uii/" + returnPath;
    }

    @Override
    public boolean execute() {
        return false;
    }

    @Override
    public String finish() {
        return "/uii/" + returnPath;
    }

    @Override
    public String getPagePath() {
        return "/uii/guiPluginNew.xhtml";
    }

    @Override
    public PluginGuiType getPluginGuiType() {
        // TODO Auto-generated method stub
        return PluginGuiType.FULL;
    }

    @Override
    public void initialize(Step step, String returnPath) {
        log.info(returnPath);
        this.step = step;
        this.returnPath = returnPath;

    }

    @Override
    public HashMap<String, StepReturnValue> validate() {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public PluginType getType() {
        return PluginType.Step;
    }

    @Override
    public String[] getJsPaths() {
        return new String[] { "riot.min.js", "tags.js", "app.js", "ugh.js" };
    }

    @Override
    public String[] getCssPaths() {
        return new String[] { "style.css" };
    }
//
//    @Override
//    public void initRoutes(Service http) {
//        Routes.initRoutes(http);
//    }
}
