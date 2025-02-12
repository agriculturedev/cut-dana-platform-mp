import {mount} from "@vue/test-utils";
import {expect} from "chai";
import ColorPicker from "../../../components/ColorPicker.vue";

describe("src/shared/components/ColorPicker.vue", () => {

    it("should render a color picker input element", () => {
        const wrapper = mount(ColorPicker, {
                data () {
                    return {
                        selectedColor: "#f50000"
                    };
                }
            }),
            input = wrapper.find("input"),
            label = wrapper.find("label");

        expect(input.exists()).to.be.true;
        expect(label.exists()).to.be.true;
        expect(label.text()).to.equal("#f50000");
    });
});
