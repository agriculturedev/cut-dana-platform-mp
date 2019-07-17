import ShadowTemplate from "text-loader!./template.html";
import SnippetSliderView from "../../snippets/slider/view";
import SnippetCheckBoxView from "../../snippets/checkbox/view";
import SnippetDatepickerView from "../../snippets/datepicker/view";
/**
 * @member ShadowTemplate
 * @description Template used to style the shadow tool
 * @memberof Tools.Shadow
 */
const ShadowView = Backbone.View.extend(/** @lends ShadowView.prototype */{
    /**
     * @class ShadowView
     * @extends Backbone.View
     * @memberof Tools.Shadow
     * @constructs
     * @fires Util#RadioRequestUtilGetUiStyle
     * @listens Menu#RadioTriggerMenuLoaderReady
     */

    events: {
        "click .glyphicon-remove": "destroy"
    },

    /**
     * Initializing module
     * @fires Util#RadioRequestUtilGetUiStyle
     * @listens Menu#RadioTriggerMenuLoaderReady
     * @returns {void}
     */
    initialize: function () {
        this.toggleButtonView = new SnippetCheckBoxView({model: this.model.get("toggleButton")});
        this.datepickerView = new SnippetDatepickerView({model: this.model.get("datepicker")});
        this.timesliderView = new SnippetSliderView({model: this.model.get("timeslider")});
        this.datesliderView = new SnippetSliderView({model: this.model.get("dateslider")});
        this.listenTo(this.model, {
            "change:isActive": this.render,
            "toggleButtonValueChanged": this.toggleElements,
            "shadowUnavailable": this.toggleUnavailableText
        });

        if (Radio.request("Util", "getUiStyle") === "TABLE") {
            this.listenTo(Radio.channel("MenuLoader"), {
                "ready": function () {
                    this.setElement("#table-tools-menu");
                    this.renderToToolbar();
                }
            });
        }
    },

    template: _.template(ShadowTemplate),
    tabletemplate: _.template("<div id='shadow-tool' class='table-tool'><a href='#'><span class='glyphicon <%= glyphicon %>'></span><span id='shadow-tool_title'><%= name %></span></a> </div>"),

    /**
     * render method
     * @returns {this} this
     */
    render: function () {
        if (this.model.get("isActive")) {
            this.setElement(document.getElementsByClassName("win-body")[0]);
            this.$el.html(this.template({}));
            this.$el.append(this.toggleButtonView.render().el);
            this.$el.append(this.datepickerView.render().el);
            this.$el.append(this.timesliderView.render().el);
            this.$el.append(this.datesliderView.render().el);
            this.toggleElements(this.model.get("isShadowEnabled"));
            this.delegateEvents();
        }
        else {
            this.undelegateEvents();
        }

        return this;
    },

    /**
     * Render Function for template in table-tool
     * @returns {this} this
     */
    renderToToolbar: function () {
        this.$el.append(this.tabletemplate(this.model.toJSON()));

        return this;
    },

    /**
     * Toggles slider elements according to the checkbox state
     * @param   {boolean} chkBoxValue Value of the checkbox
     * @returns {void}
     */
    toggleElements: function (chkBoxValue) {
        this.$el.find(".slider-container, .datepicker-container").each(function (index, slider) {
            if (chkBoxValue) {
                slider.style.display = "block";
            }
            else {
                slider.style.display = "none";
            }
        });
    },

    /**
     * Toggles info text
     * @param   {boolean} chkBoxValue Value of the checkbox
     * @returns {void}
     */
    toggleUnavailableText: function (chkBoxValue) {
        if (chkBoxValue === true) {
            this.$el.find(".not3d").hide();
        }
        else {
            this.$el.find(".not3d").show();
        }
    }
});

export default ShadowView;
