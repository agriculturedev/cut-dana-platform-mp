import {config, mount} from "@vue/test-utils";
import MenuContainerBodyRootLogo from "../../../components/MenuContainerBodyRootLogo.vue";
import {expect} from "chai";

config.global.mocks.$t = key => key;

describe("src/modules/menu/MenuContainerBodyRootLogo.vue", () => {
    let wrapper;

    it("renders the logo and other props", () => {
        const props = {
            idAppendix: "idAppendix",
            text: "text",
            logo: "https://geodienste.hamburg.de/lgv-config/img/hh-logo.png",
            link: "https://geoinfo.hamburg.de",
            toolTip: "Landesbetrieb Geoinformation und Vermessung"
        };

        wrapper = mount(MenuContainerBodyRootLogo,
            {global: {},
                propsData: props
            });

        expect(wrapper.find("#mp-menu-logo-idAppendix").exists()).to.be.true;
        expect(wrapper.find("#mp-menu-logo-idAppendix").attributes("title")).to.be.equals(props.toolTip);
        expect(wrapper.find("#mp-menu-logo-idAppendix").attributes("href")).to.be.equals(props.link);
        expect(wrapper.find("#mp-menu-logo-idAppendix > img").attributes("src")).to.be.equals(props.logo);
        expect(wrapper.find("#mp-menu-logo-idAppendix > img").attributes("alt")).to.be.equals(props.toolTip);
        expect(wrapper.find("#mp-menu-logo-idAppendix > h1").text()).to.be.equals(props.text);
    });

    it("renders without minimal props", () => {
        const props = {
            idAppendix: "idAppendix",
            text: "text"
        };

        wrapper = mount(MenuContainerBodyRootLogo,
            {global: {},
                propsData: props
            });

        expect(wrapper.find("#mp-menu-logo-idAppendix").exists()).to.be.true;
        expect(wrapper.find("#mp-menu-logo-idAppendix").attributes("title")).to.be.equals("");
        expect(wrapper.find("#mp-menu-logo-idAppendix").attributes("href")).to.be.equals("#");
        expect(wrapper.find("#mp-menu-logo-idAppendix > img").exists()).to.be.false;
        expect(wrapper.find("#mp-menu-logo-idAppendix > h1").text()).to.be.equals(props.text);
    });
});
