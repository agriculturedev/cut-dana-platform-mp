import {createStore} from "vuex";
import {config, shallowMount} from "@vue/test-utils";
import FileImportComponent from "../../../components/FileImport.vue";
import {expect} from "chai";
import sinon from "sinon";

config.global.mocks.$t = key => key;

describe("src/modules/fileImport/components/FileImport.vue", () => {
    let store,
        wrapper;

    beforeEach(() => {
        mapCollection.clear();

        store = createStore({
            modules: {
                namespaced: true,
                Modules: {
                    namespaced: true,
                    modules: {
                        namespaced: true,
                        FileImport: {
                            namespaced: true,
                            getters: {
                                layer: () => {
                                    return {
                                        getSource: () => ({getFeatures: () => []})
                                    };
                                },
                                importedFileNames: () => [],
                                selectedFiletype: () => "auto",
                                featureExtents: () => ({
                                    "file1": [0, 1, 2, 3],
                                    "file3": [0, 1, 2, 3]
                                })
                            },
                            mutations: {
                                setImportedFileNames: sinon.stub(),
                                setFeatureExtents: sinon.stub()
                            }
                        }
                    }
                }
            }
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    it("renders the fileImport", () => {
        wrapper = shallowMount(FileImportComponent, {
            global: {
                plugins: [store]
            }});

        expect(wrapper.find("#file-import").exists()).to.be.true;
    });

    it("modifies the imported file names", () => {
        const fileNames = ["file1", "file3"];

        store = createStore({
            modules: {
                namespaced: true,
                Modules: {
                    namespaced: true,
                    modules: {
                        namespaced: true,
                        FileImport: {
                            namespaced: true,
                            getters: {
                                featureExtents: sinon.stub(),
                                layer: () => {
                                    return {
                                        getSource: () => ({getFeatures: () => []})
                                    };
                                },
                                importedFileNames: () => []
                            },
                            mutations: {
                                setImportedFileNames: sinon.stub(),
                                setFeatureExtents: sinon.stub()
                            }
                        }
                    }
                }
            }
        });

        wrapper = shallowMount(FileImportComponent, {
            global: {
                plugins: [store]
            }});
        wrapper.vm.modifyImportedFileNames(fileNames);

        expect(wrapper.vm.importedFileNames).to.deep.equal([]);
    });

    it("modifies the imported file extent", () => {
        const featureExtents = {
                "file1": [0, 1, 2, 3],
                "file2": [0, 1, 2, 3],
                "file3": [0, 1, 2, 3]
            },
            fileNames = ["file1", "file3"];

        wrapper = shallowMount(FileImportComponent, {
            global: {
                plugins: [store]
            }});
        wrapper.vm.modifyImportedFileExtent(featureExtents, fileNames);

        expect(wrapper.vm.featureExtents).to.deep.equal({"file1": [0, 1, 2, 3], "file3": [0, 1, 2, 3]});
    });
});
