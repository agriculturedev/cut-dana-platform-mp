import {createStore} from "vuex";
import {config, shallowMount} from "@vue/test-utils";
import LegendSingleLayerComponent from "../../../components/LegendSingleLayer.vue";
import Legend from "../../../store/indexLegend";
import {expect} from "chai";
import sinon from "sinon";

config.global.mocks.$t = key => key;

describe("src/modules/legend/components/LegendSingleLayer.vue", () => {
    let store,
        wrapper;

    Legend.getters.sldVersion = () => {
        return "1.1.0";
    };

    beforeEach(() => {
        store = createStore({
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        namespaced: true,
                        Legend: Legend
                    }
                }
            }
        });
    });
    afterEach(() => {
        sinon.restore();
    });


    describe("LegendSingleLayerComponent.vue rendering", () => {
        describe("renders legend with pdf", () => {
            it("renders the legend with pdf from array with single string", () => {
                const propsData = {
                    legendObj: {
                        name: "myLayer",
                        legend: ["https://link_to_pdf.pdf"],
                        position: 1
                    }
                };

                wrapper = shallowMount(LegendSingleLayerComponent, {
                    global: {
                        plugins: [store]
                    },
                    propsData
                });

                expect(wrapper.find(".layer-legend > div:nth-child(1) a").exists()).to.be.true;
                expect(wrapper.find(".layer-legend > div:nth-child(1) a").attributes().href).to.equal("https://link_to_pdf.pdf");
            });
            it("renders the legends with pdf from array of strings", () => {
                const propsData = {
                    legendObj: {
                        name: "myLayer",
                        legend: ["https://link_to_pdf.pdf", "https://another_link_to_pdf.pdf"],
                        position: 1
                    }
                };

                wrapper = shallowMount(LegendSingleLayerComponent, {
                    global: {
                        plugins: [store]
                    },
                    propsData
                });
                expect(wrapper.find(".layer-legend > div:nth-child(1) a").exists()).to.be.true;
                expect(wrapper.find(".layer-legend > div:nth-child(1) a").attributes().href).to.equal("https://link_to_pdf.pdf");
                expect(wrapper.find(".layer-legend > div:nth-child(2) a").exists()).to.be.true;
                expect(wrapper.find(".layer-legend > div:nth-child(2) a").attributes().href).to.equal("https://another_link_to_pdf.pdf");
            });
            it("renders the legend with pdf from array with single object", () => {
                const propsData = {
                    legendObj: {
                        name: "myLayer",
                        legend: [{
                            name: "foobar",
                            graphic: "https://link_to_pdf.pdf"
                        }],
                        position: 1
                    }
                };

                wrapper = shallowMount(LegendSingleLayerComponent, {
                    global: {
                        plugins: [store]
                    },
                    propsData
                });

                expect(wrapper.find(".layer-legend > div:nth-child(1) a").exists()).to.be.true;
                expect(wrapper.find(".layer-legend > div:nth-child(1) a").attributes().href).to.equal("https://link_to_pdf.pdf");
                expect(wrapper.find(".layer-legend > div:nth-child(1) span").text()).to.equal("foobar");
            });
            it("renders the legends with pdf from array of objects", () => {
                const propsData = {
                    legendObj: {
                        name: "myLayer",
                        legend: [{
                            name: "foobar",
                            graphic: "https://link_to_pdf.pdf"
                        },
                        {
                            name: "barfoo",
                            graphic: "https://another_link_to_pdf.pdf"
                        }],
                        position: 1
                    }
                };

                wrapper = shallowMount(LegendSingleLayerComponent, {
                    global: {
                        plugins: [store]
                    },
                    propsData
                });
                expect(wrapper.find(".layer-legend > div:nth-child(1) a").exists()).to.be.true;
                expect(wrapper.find(".layer-legend > div:nth-child(1) a").attributes().href).to.equal("https://link_to_pdf.pdf");
                expect(wrapper.find(".layer-legend > div:nth-child(1) span").text()).to.equal("foobar");
                expect(wrapper.find(".layer-legend > div:nth-child(2) a").exists()).to.be.true;
                expect(wrapper.find(".layer-legend > div:nth-child(2) a").attributes().href).to.equal("https://another_link_to_pdf.pdf");
                expect(wrapper.find(".layer-legend > div:nth-child(2) span").text()).to.equal("barfoo");
            });
        });
    });
    describe("renders legend with img", () => {
        it("renders the legend with img from array with single string", () => {
            const propsData = {
                legendObj: {
                    name: "myLayer",
                    legend: ["some_string_interpreted_as_image"],
                    position: 1
                }
            };

            wrapper = shallowMount(LegendSingleLayerComponent, {
                global: {
                    plugins: [store]
                },
                propsData
            });

            expect(wrapper.find(".layer-legend > div:nth-child(1) img").exists()).to.be.true;
            expect(wrapper.find(".layer-legend > div:nth-child(1) img").attributes().src).to.equal("some_string_interpreted_as_image");
        });
        it("renders the legends with img from array of strings", () => {
            const propsData = {
                legendObj: {
                    name: "myLayer",
                    legend: ["some_string_interpreted_as_image", "another_string_interpreted_as_image"],
                    position: 1
                }
            };

            wrapper = shallowMount(LegendSingleLayerComponent, {
                global: {
                    plugins: [store]
                },
                propsData
            });
            expect(wrapper.find(".layer-legend > div:nth-child(1) img").exists()).to.be.true;
            expect(wrapper.find(".layer-legend > div:nth-child(1) img").attributes().src).to.equal("some_string_interpreted_as_image");
            expect(wrapper.find(".layer-legend > div:nth-child(2) img").exists()).to.be.true;
            expect(wrapper.find(".layer-legend > div:nth-child(2) img").attributes().src).to.equal("another_string_interpreted_as_image");
        });
        it("renders the legend with img from array with single object", () => {
            const propsData = {
                legendObj: {
                    name: "myLayer",
                    legend: [{
                        name: "foobar",
                        graphic: "some_string_interpreted_as_image"
                    }],
                    position: 1
                }
            };

            wrapper = shallowMount(LegendSingleLayerComponent, {
                global: {
                    plugins: [store]
                },
                propsData
            });

            expect(wrapper.find(".layer-legend > div:nth-child(1) img").exists()).to.be.true;
            expect(wrapper.find(".layer-legend > div:nth-child(1) img").attributes().src).to.equal("some_string_interpreted_as_image");
            expect(wrapper.find(".layer-legend > div:nth-child(1) span").text()).to.equal("foobar");
        });
        it("renders the legends with img from array of objects", () => {
            const propsData = {
                legendObj: {
                    name: "myLayer",
                    legend: [{
                        name: "foobar",
                        graphic: "some_string_interpreted_as_image"
                    },
                    {
                        name: "barfoo",
                        graphic: "another_string_interpreted_as_image"
                    }],
                    position: 1
                }
            };

            wrapper = shallowMount(LegendSingleLayerComponent, {
                global: {
                    plugins: [store]
                },
                propsData
            });
            expect(wrapper.find(".layer-legend > div:nth-child(1) img").exists()).to.be.true;
            expect(wrapper.find(".layer-legend > div:nth-child(1) img").attributes().src).to.equal("some_string_interpreted_as_image");
            expect(wrapper.find(".layer-legend > div:nth-child(1) span").text()).to.equal("foobar");
            expect(wrapper.find(".layer-legend > div:nth-child(2) img").exists()).to.be.true;
            expect(wrapper.find(".layer-legend > div:nth-child(2) img").attributes().src).to.equal("another_string_interpreted_as_image");
            expect(wrapper.find(".layer-legend > div:nth-child(2) span").text()).to.equal("barfoo");
        });
        it("renders the legend with img with sldVersion request", () => {
            const propsData = {
                id: "legend_myLayer",
                legendObj: {
                    name: "myLayer",
                    legend: ["some_request_for_an_image?REQUEST=GetLegendGraphic"],
                    position: 1
                }
            };

            wrapper = shallowMount(LegendSingleLayerComponent, {
                global: {
                    plugins: [store]
                },
                propsData
            });
            expect(wrapper.find("#legend_myLayer > div:nth-child(1) img").attributes().src).includes("&sld_version=1.1.0");
        });
    });
    describe("renders legend with svg", () => {
        it("renders the legend with svg from array with single object", () => {
            const propsData = {
                legendObj: {
                    name: "myLayer",
                    legend: [{
                        name: "foobar",
                        graphic: null
                    }],
                    position: 1
                }
            };
            let svg = "data:image/svg+xml;charset=utf-8,";

            svg += "<svg height='35' width='35' version='1.1' xmlns='http://www.w3.org/2000/svg'>";
            svg += "<polygon points='5,5 30,5 30,30 5,30' style='fill:";
            svg += "rgba(255,0,0)";
            svg += ";fill-opacity:";
            svg += "0";
            svg += ";stroke:";
            svg += "rgba(0,0,255)";
            svg += ";stroke-opacity:";
            svg += "0";
            svg += ";stroke-width:";
            svg += "1";
            svg += ";'/>";
            svg += "</svg>";
            propsData.legendObj.legend[0].graphic = svg;


            wrapper = shallowMount(LegendSingleLayerComponent, {
                global: {
                    plugins: [store]
                },
                propsData
            });

            expect(wrapper.find(".layer-legend > div:nth-child(1) img").exists()).to.be.true;
            expect(wrapper.find(".layer-legend > div:nth-child(1) span").text()).to.equal("foobar");
        });
        it("renders the legends with svg from array of objects", () => {
            const propsData = {
                legendObj: {
                    name: "myLayer",
                    legend: [{
                        name: "foobar",
                        graphic: null
                    },
                    {
                        name: "barfoo",
                        graphic: null
                    }],
                    position: 1
                }
            };
            let svg = "data:image/svg+xml;charset=utf-8,";

            svg += "<svg height='35' width='35' version='1.1' xmlns='http://www.w3.org/2000/svg'>";
            svg += "<polygon points='5,5 30,5 30,30 5,30' style='fill:";
            svg += "rgba(255,0,0)";
            svg += ";fill-opacity:";
            svg += "0";
            svg += ";stroke:";
            svg += "rgba(0,0,255)";
            svg += ";stroke-opacity:";
            svg += "0";
            svg += ";stroke-width:";
            svg += "1";
            svg += ";'/>";
            svg += "</svg>";
            propsData.legendObj.legend[0].graphic = svg;
            propsData.legendObj.legend[1].graphic = svg;

            wrapper = shallowMount(LegendSingleLayerComponent, {
                global: {
                    plugins: [store]
                },
                propsData
            });
            expect(wrapper.find(".layer-legend > div:nth-child(1) img").exists()).to.be.true;
            expect(wrapper.find(".layer-legend > div:nth-child(1) span").text()).to.equal("foobar");
            expect(wrapper.find(".layer-legend > div:nth-child(2) img").exists()).to.be.true;
            expect(wrapper.find(".layer-legend > div:nth-child(2) span").text()).to.equal("barfoo");
        });
        it("renders the legends with graphic is an array", () => {
            const propsData = {
                legendObj: {
                    name: "myLayer",
                    legend: [{
                        name: "foobar",
                        graphic: ["some_string_interpreted_as_image1", "some_string_interpreted_as_image2"],
                        iconSize: ["60", "60"],
                        iconSizeDifferenz: "10"
                    }],
                    position: 1
                }
            };

            wrapper = shallowMount(LegendSingleLayerComponent, {
                global: {
                    plugins: [store]
                },
                propsData
            });
            expect(wrapper.findAll(".layer-legend > div:nth-child(1) img")[0].exists()).to.be.true;
            expect(wrapper.findAll(".layer-legend > div:nth-child(1) img")[0].attributes().src).to.equal("some_string_interpreted_as_image2");
            expect(wrapper.findAll(".layer-legend > div:nth-child(1) img")[0].attributes().style).to.equal("width: 60px; height: 60px; margin: 10px;");
            expect(wrapper.find(".layer-legend > div:nth-child(1) span").text()).to.equal("foobar");
            expect(wrapper.findAll(".layer-legend > div:nth-child(1) img")[1].exists()).to.be.true;
            expect(wrapper.findAll(".layer-legend > div:nth-child(1) img")[1].attributes().src).to.equal("some_string_interpreted_as_image1");
        });
    });
});
