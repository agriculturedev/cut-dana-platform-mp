import {config, shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import TableComponent from "../../components/TableComponent.vue";
import sinon from "sinon";
import {createStore} from "vuex";

config.global.mocks.$t = key => key;

describe("src/shared/modules/table/components/TableComponent.vue", () => {
    const store = createStore({
        namespaces: true,
        modules: {
            Modules: {
                namespaced: true,
                modules: {
                    Language: {
                        namespaced: true,
                        getters: {
                            currentLocale: () => "de-DE"
                        }
                    }
                }
            }
        }
    });

    describe("DOM", () => {
        it("should render the title if present", () => {
            const wrapper = shallowMount(TableComponent, {
                propsData: {
                    data: {
                        headers: ["foo"],
                        items: [["bar"]]
                    },
                    title: "Titel"
                }
            });

            expect(wrapper.find(".title").text()).to.be.equal("Titel");
        });

        it("should render without a title", () => {
            const wrapper = shallowMount(TableComponent, {
                propsData: {
                    data: {
                        headers: ["foo"],
                        items: [["bar"]]
                    }
                }
            });

            expect(wrapper.find(".title").exists()).to.be.false;
        });

        it("should render the hits if present", () => {
            const wrapper = shallowMount(TableComponent, {
                propsData: {
                    data: {
                        headers: ["foo"],
                        items: [["bar"]]
                    },
                    hits: "Hits"
                }
            });

            expect(wrapper.find(".hits").exists()).to.be.true;
        });

        it("should render without the hits", () => {
            const wrapper = shallowMount(TableComponent, {
                propsData: {
                    data: {
                        headers: ["foo"],
                        items: [["bar"]]
                    }
                }
            });

            expect(wrapper.find(".hits").exists()).to.be.false;
        });

        it("should render the table with one row", () => {
            const wrapper = shallowMount(TableComponent, {
                propsData: {
                    data: {
                        headers: ["foo"],
                        items: [["bar"]]
                    }
                }
            });

            expect(wrapper.findAll("th").length).to.be.equal(1);
        });

        it("should render the table with multiple columns and rows", () => {
            const wrapper = shallowMount(TableComponent, {
                propsData: {
                    data: {
                        headers: ["foo", "bar", "buz"],
                        items: [
                            ["foo", "bar", "buz"],
                            ["foo", "bar", "buz"],
                            ["foo", "bar", "buz"],
                            ["foo", "bar", "buz"]
                        ]
                    }
                }
            });

            expect(wrapper.findAll("tr").length).to.be.equal(5);
            expect(wrapper.findAll("th").length).to.be.equal(3);
        });

        it("should render table without sorting arrows", () => {
            const wrapper = shallowMount(TableComponent, {
                propsData: {
                    data: {
                        headers: ["foo"]
                    }
                }
            });

            expect(wrapper.findAll(".sortable-icon").length).to.be.equal(0);
        });

        it("should render table with sorting arrows", () => {
            const wrapper = shallowMount(TableComponent, {
                propsData: {
                    data: {
                        headers: ["foo"]
                    },
                    sortable: true
                }
            });

            expect(wrapper.findAll(".sortable-icon").length).to.be.equal(1);
        });

    });
    describe("methods", () => {
        describe("getIconClassByOrder", () => {
            it("should return 'bi-arrow-down-up origin-order' if sorting column name not equals current sorting name", () => {
                const wrapper = shallowMount(TableComponent, {
                        propsData: {
                            data: {}
                        }
                    }),
                    expected = "bi-arrow-down-up origin-order";

                wrapper.vm.currentSorting = {};
                expect(wrapper.vm.getIconClassByOrder("foo")).to.be.equals(expected);
            });
            it("should return 'bi-arrow-up' if current sorting order is asc", () => {
                const wrapper = shallowMount(TableComponent, {
                        propsData: {
                            data: {}
                        }
                    }),
                    expected = "bi-arrow-up";

                wrapper.vm.currentSorting = {
                    columnName: "foo",
                    order: "asc"
                };
                expect(wrapper.vm.getIconClassByOrder("foo")).to.be.equals(expected);
            });
            it("should return 'bi-arrow-down' if current sorting order is desc", () => {
                const wrapper = shallowMount(TableComponent, {
                        propsData: {
                            data: {}
                        }
                    }),
                    expected = "bi-arrow-down";

                wrapper.vm.currentSorting = {
                    columnName: "foo",
                    order: "desc"
                };
                expect(wrapper.vm.getIconClassByOrder("foo")).to.be.equals(expected);
            });
            it("should return 'bi-arrow-down-up origin-order' if current sorting order is not desc nor asc", () => {
                const wrapper = shallowMount(TableComponent, {
                        propsData: {
                            data: {}
                        }
                    }),
                    expected = "bi-arrow-down-up origin-order";

                wrapper.vm.currentSorting = {
                    columnName: "foo",
                    order: "baz"
                };
                expect(wrapper.vm.getIconClassByOrder("foo")).to.be.equals(expected);
            });
        });
        describe("getSortOrder", () => {
            it("should return 'desc' order when passed 'origin'", () => {
                const wrapper = shallowMount(TableComponent, {
                        propsData: {
                            data: {}
                        }
                    }),
                    order = wrapper.vm.getSortOrder("origin");

                expect(order).to.be.equal("desc");
            });

            it("should return 'asc' order when passed 'desc'", () => {
                const wrapper = shallowMount(TableComponent, {
                        propsData: {
                            data: {}
                        }
                    }),
                    order = wrapper.vm.getSortOrder("desc");

                expect(order).to.be.equal("asc");
            });

            it("should return 'origin' order when passed 'asc'", () => {
                const wrapper = shallowMount(TableComponent, {
                        propsData: {
                            data: {}
                        }
                    }),
                    order = wrapper.vm.getSortOrder("asc");

                expect(order).to.be.equal("origin");
            });
        });
        describe("getSortedItems", () => {
            it("should return the 'originItems' if the items are to be sorted in their origin order", () => {
                const wrapper = shallowMount(TableComponent, {
                        propsData: {
                            data: {
                                headers: ["foo", "bar", "buz"],
                                items: [
                                    ["foo", "bar", "buz"],
                                    ["fow", "bar", "buz"],
                                    ["fox", "bar", "buz"],
                                    ["foy", "bar", "buz"]
                                ]
                            }
                        }
                    }),
                    originRows = wrapper.vm.getSortedItems([], "foo", "origin");

                expect(originRows).to.deep.equal(wrapper.vm.data.items);
            });
            it("should return the items in ascending order", () => {
                const wrapper = shallowMount(TableComponent, {
                        propsData: {
                            data: {}
                        },
                        global: {
                            plugins: [store]
                        }
                    }),
                    items = [{
                        "bar": "bara"
                    },
                    {
                        "bar": "barc"
                    },
                    {
                        "bar": "barb"
                    }],
                    expectItems = [
                        {
                            "bar": "bara"
                        },
                        {
                            "bar": "barb"
                        },
                        {
                            "bar": "barc"
                        }
                    ],
                    sortedItems = wrapper.vm.getSortedItems(items, "bar", "asc");

                expect(sortedItems).to.deep.equal(expectItems);
            });
            it("should return the items in descending order", () => {
                const wrapper = shallowMount(TableComponent, {
                        propsData: {
                            data: {}
                        },
                        global: {
                            plugins: [store]
                        }
                    }),
                    items = [{
                        "bar": "bara"
                    },
                    {
                        "bar": "barc"
                    },
                    {
                        "bar": "barb"
                    }],
                    expectItems = [
                        {
                            "bar": "barc"
                        },
                        {
                            "bar": "barb"
                        },
                        {
                            "bar": "bara"
                        }
                    ],
                    sortedItems = wrapper.vm.getSortedItems(items, "bar", "desc");

                expect(sortedItems).to.deep.equal(expectItems);
            });
            // it("should return the rows in ascending order with the undefined data at the beginning", () => {
            //     const wrapper = shallowMount(TableComponent, {
            //             propsData: {
            //                 data: {}
            //             }
            //         }),
            //         items = [
            //             {
            //                 "name": "klm"
            //             },
            //             {
            //                 "name": "xyz"
            //             },
            //             {},
            //             {
            //                 "name": "abc"
            //             }
            //         ],
            //         expectItems = [
            //             {},
            //             {
            //                 "name": "abc"
            //             },
            //             {
            //                 "name": "klm"
            //             },
            //             {
            //                 "name": "xyz"
            //             }
            //         ],
            //         sortedRows = wrapper.vm.getSortedItems(items, "asc", "name");

            //     expect(sortedRows).to.deep.equal(expectItems);
            // });
        });
        describe("runSorting", () => {
            it("should call expected functions", () => {
                const wrapper = shallowMount(TableComponent, {
                        propsData: {
                            data: {}
                        }
                    }),
                    getSortOrderStub = sinon.stub(wrapper.vm, "getSortOrder"),
                    getSortedItemsStub = sinon.stub(wrapper.vm, "getSortedItems");

                wrapper.vm.runSorting("foo");
                expect(getSortOrderStub.called).to.be.true;
                expect(getSortedItemsStub.called).to.be.true;
                sinon.restore();
            });
            it("should set the sort order for the columns correctly", async () => {
                const wrapper = shallowMount(TableComponent, {
                    propsData: {
                        data: {}
                    }
                });

                sinon.stub(wrapper.vm, "getSortedItems");
                await wrapper.setData({
                    currentSorting: {
                        columnName: "foo",
                        order: "origin"
                    }
                });
                wrapper.vm.runSorting("foo");
                expect(wrapper.vm.currentSorting.order).to.be.equal("desc");
                sinon.restore();
            });
            it("should set the sort order for the columns correctly", async () => {
                const wrapper = shallowMount(TableComponent, {
                    propsData: {
                        data: {}
                    }
                });

                sinon.stub(wrapper.vm, "getSortedItems");
                await wrapper.setData({
                    currentSorting: {
                        columnName: "foo",
                        order: "desc"
                    }
                });
                wrapper.vm.runSorting("foo");
                expect(wrapper.vm.currentSorting.order).to.be.equal("asc");
                sinon.restore();
            });
            it("should set the sort order for the columns correctly", async () => {
                const wrapper = shallowMount(TableComponent, {
                    propsData: {
                        data: {}
                    }
                });

                sinon.stub(wrapper.vm, "getSortedItems");
                await wrapper.setData({
                    currentSorting: {
                        columnName: "foo",
                        order: "asc"
                    }
                });
                wrapper.vm.runSorting("foo");
                expect(wrapper.vm.currentSorting.order).to.be.equal("origin");
                sinon.restore();
            });
        });
    });
});
