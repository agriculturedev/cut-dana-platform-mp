define([
    "underscore",
    "backbone",
    "models/TreeNode",
    "config",
    "eventbus"
    ], function (_, Backbone, TreeNode, Config, EventBus) {

        //interpretiere Pfade relativ von requirejs baseurl
        var baseUrl = require.toUrl('').split('?')[0];

        var TreeList = Backbone.Collection.extend({
            "url": baseUrl + Config.categoryConf,
            "model": TreeNode,
            "initialize": function () {
                EventBus.on("showLayerInTree", this.showLayerInTree, this);
                EventBus.on("fetchTreeList", this.fetchCategories, this);
                this.fetchCategories();

                // leere Ordner entfernen
                var modelsToRemove = this.filter(function (model) {
                    return model.get("layerList").length === 0;
                });
                this.remove(modelsToRemove);
            },
            "parse": function (response, options) {
                if(_.has(Config, "tree") && Config.tree.active === true) {
                    switch (options.data) {
                        case "opendata":
                            _.each(response.opendata, function (element) {
                                element.layerAttribute = "kategorieOpendata";
                            });
                            return response.opendata;
                        case "inspire":
                            _.each(response.inspire, function (element) {
                                element.layerAttribute = "kategorieInspire";
                            });
                            return response.inspire;
                        default:
                            _.each(response.opendata, function (element) {
                                element.layerAttribute = "kategorieOpendata";
                            });
                            return response.opendata;
                    }
                }
            },

            "fetchCategories": function (value) {
                this.fetch({
                    data: value,
                    cache: false,
                    async: false,
                    error: function () {
                        alert("Fehler beim Parsen von: " + baseUrl + Config.categoryConf);
                    }
                });
            },

            "showLayerInTree": function (model) {
                // öffnet den Tree
                $(".nav li:first-child").addClass("open");
                this.forEach(function (element) {
                    if (model.get("kategorieOpendata") === element.get("kategorie") || model.get("kategorieInspire") === element.get("kategorie")) {
                        element.set("isExpanded", true);
                            _.each(element.get("childViews"), function (view) {
                                if (view.model.get("name") === model.get("metaName")) {
                                    view.model.set("isExpanded", true);
                                    var modelID = _.where(view.model.get("children"), {cid: model.cid});
                                    var viewChildLayer = _.find(view.model.get("childViews"), function (view) {
                                        return view.model.cid === modelID[0].cid;
                                    });
                                    $("#tree").scrollTop(viewChildLayer.$el[0].offsetTop - 100);
                                }
                                else if (view.model.get("name") === model.get("name")){
                                    $("#tree").scrollTop(view.$el[0].offsetTop - 100);
                                }
                            });
                        model.set("selected", true);
                    }
                    else {
                        element.set("isExpanded", false);
                    }
                });
            }
        });

        return new TreeList();
    });
