import {config, shallowMount, mount} from "@vue/test-utils";
import {expect} from "chai";
import TableComponent from "../../components/TableComponent.vue";
import sinon from "sinon";
import {createStore} from "vuex";

config.global.mocks.$t = key => key;

describe("src/shared/modules/table/components/TableComponent.vue", () => {
    let store;

    beforeEach(() => {
        store = createStore({
            namespaced: true,
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        namespaced: true,
                        Language: {
                            namespaced: true,
                            getters: {
                                currentLocale: sinon.stub()
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

    describe("DOM", () => {
        it("should render the title if present", () => {
            const wrapper = shallowMount(TableComponent, {
                props: {
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
                props: {
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
                props: {
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
                props: {
                    data: {
                        headers: ["foo"],
                        items: [["bar"]]
                    }
                }
            });

            expect(wrapper.find(".hits").exists()).to.be.false;
        });

        it("should render the table with one row", async () => {
            const wrapper = shallowMount(TableComponent, {
                props: {
                    data: {
                        headers: [{name: "foo", index: 0}],
                        items: [["bar"]]
                    }
                }
            });

            await wrapper.vm.$nextTick();
            expect(wrapper.findAll("th").length).to.be.equal(1);
        });

        it("should render the table with multiple columns and rows", async () => {
            const wrapper = shallowMount(TableComponent, {
                props: {
                    data: {
                        headers: [{name: "foo", index: 0}, {name: "bar", index: 1}, {name: "buz", index: 2}],
                        items: [
                            ["foo", "bar", "buz"],
                            ["foo", "bar", "buz"],
                            ["foo", "bar", "buz"],
                            ["foo", "bar", "buz"]
                        ]
                    }
                }
            });

            await wrapper.vm.$nextTick();
            expect(wrapper.findAll("tr").length).to.be.equal(5);
            expect(wrapper.findAll("th").length).to.be.equal(3);
        });

        it("should render table without sorting arrows", async () => {
            const wrapper = shallowMount(TableComponent, {
                props: {
                    data: {
                        headers: [{name: "foo", index: 0}]
                    }
                }
            });

            await wrapper.vm.$nextTick();
            expect(wrapper.findAll(".sortable-icon").length).to.be.equal(0);
        });

        it("should render table with sorting arrows", async () => {
            const wrapper = shallowMount(TableComponent, {
                props: {
                    data: {
                        headers: [{name: "foo", index: 0}]
                    },
                    sortable: true
                }
            });

            await wrapper.vm.$nextTick();
            expect(wrapper.findAll(".sortable-icon").length).to.be.equal(1);
        });

        it("should render table without settings menu", async () => {
            const wrapper = shallowMount(TableComponent, {
                props: {
                    data: {
                        headers: [{name: "foo", index: 0}]
                    }
                }
            });

            await wrapper.vm.$nextTick();
            expect(wrapper.findAll("#table-settings").length).to.be.equal(0);
        });

        it("should render table with sorting arrows", async () => {
            const wrapper = shallowMount(TableComponent, {
                props: {
                    data: {
                        headers: [{name: "foo", index: 0}]
                    },
                    enableSettings: true
                }
            });

            await wrapper.vm.$nextTick();
            expect(wrapper.findAll("#table-settings").length).to.be.equal(1);
        });
        it("should render table with multiselect", async () => {
            const wrapper = shallowMount(TableComponent, {
                props: {
                    data: {
                        headers: [{name: "foo", index: 0}, {name: "bar", index: 1}, {name: "buz", index: 2}],
                        items: [
                            ["foo", "bar", "buz"]
                        ]
                    },
                    filterable: true
                }
            });

            await wrapper.vm.$nextTick();
            expect(wrapper.find(".multiselect-dropdown").exists()).to.be.true;
        });
        it("should render table without multiselect, when filterable is false", async () => {
            const wrapper = shallowMount(TableComponent, {
                props: {
                    data: {
                        headers: [{name: "foo", index: 0}, {name: "bar", index: 1}, {name: "buz", index: 2}],
                        items: [
                            ["foo", "bar", "buz"]
                        ]
                    },
                    filterable: false
                }
            });

            await wrapper.vm.$nextTick();
            expect(wrapper.find(".multiselect-dropdown").exists()).to.be.false;
        });
        it("should render table without multiselect, when filterable doesn't exist", async () => {
            const wrapper = shallowMount(TableComponent, {
                props: {
                    data: {
                        headers: [{name: "foo", index: 0}, {name: "bar", index: 1}, {name: "buz", index: 2}],
                        items: [
                            ["foo", "bar", "buz"]
                        ]
                    }
                }
            });

            await wrapper.vm.$nextTick();
            expect(wrapper.find(".multiselect-dropdown").exists()).to.be.false;
        });
        it("should not render hint text", () => {
            const wrapper = shallowMount(TableComponent, {
                props: {
                    data: {},
                    totalProp: true
                }
            });

            expect(wrapper.find(".hint").exists()).to.be.false;
        });
        it("should render hint text", async () => {
            const wrapper = shallowMount(TableComponent, {
                props: {
                    data: {},
                    totalProp: {
                        hintText: "some text"
                    }
                }
            });

            await wrapper.setData({showTotalData: true});

            expect(wrapper.find(".hint").exists()).to.be.true;
        });
        it("should not render total button", () => {
            const wrapper = shallowMount(TableComponent, {
                props: {
                    data: {},
                    totalProp: false
                }
            });

            expect(wrapper.find(".total-button").exists()).to.be.false;
        });
        it("should render total button", () => {
            const wrapper = shallowMount(TableComponent, {
                props: {
                    data: {},
                    totalProp: {
                        enabled: true,
                        hintText: "some text"
                    }
                }
            });

            expect(wrapper.find(".total-button").exists()).to.be.true;
        });
        it("should not render total row", async () => {
            const wrapper = shallowMount(TableComponent, {
                props: {
                    data: {}
                },
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.find(".total").exists()).to.be.false;
        });
        it("should render total row", async () => {
            const wrapper = shallowMount(TableComponent, {
                plugins: [store],
                props: {
                    totalProp: {
                        enabled: true,
                        rowTitle: true
                    },
                    data: {
                        headers: [{name: "foo", index: 0}, {name: "bar", index: 1}, {name: "buz", index: 2}],
                        items: [
                            {foo: "Total", bar: 1, buz: 1},
                            {foo: "Total", bar: 2, buz: 2},
                            {foo: "Total", bar: 3, buz: 3}
                        ]
                    }
                }
            });

            await wrapper.vm.$nextTick();
            await wrapper.setData({showTotalData: true, firstColumnName: "foo"});

            expect(wrapper.find(".total").exists()).to.be.true;
        });
    });
    describe("column visibility", () => {
        it("should render all checkboxes and include them in 'visibleHeaders'", async () => {
            const wrapper = shallowMount(TableComponent, {
                props: {
                    data: {
                        headers: [
                            {name: "foo", index: 0},
                            {name: "bar", index: 1}
                        ]
                    }
                }
            });

            expect(wrapper.vm.visibleHeaders).to.have.lengthOf(2);
        });

        it("should render download button if 'downloadable' is true", () => {
            const wrapper = shallowMount(TableComponent, {
                props: {
                    data: {
                        headers: [{name: "foo", index: 0}],
                        items: [["bar"]]
                    },
                    downloadable: true
                }
            });

            expect(wrapper.find("#table-download").exists()).to.be.true;
        });
        it("should not render download button if 'downloadable' is not given", () => {
            const wrapper = shallowMount(TableComponent, {
                props: {
                    data: {
                        headers: [{name: "foo", index: 0}],
                        items: [["bar"]]
                    }
                }
            });

            expect(wrapper.find("#table-download").exists()).to.be.false;
        });
    });
    describe("User Interactions", () => {
        it("should call 'resetAll' when the resetAll button is clicked", async () => {
            const wrapper = mount(TableComponent, {
                    props: {
                        data: {
                            headers: [{name: "foo", index: 0}]
                        },
                        enableSettings: true
                    }
                }),
                button = wrapper.find("#table-reset"),
                resetAllSpy = sinon.spy(wrapper.vm, "resetAll");

            await button.trigger("click");
            expect(resetAllSpy.calledOnce).to.be.true;
            sinon.restore();
        });
    });
    describe("methods", () => {
        describe("exportTable", () => {
            it("should return editedTable.items if no additional columns are passed", () => {
                const wrapper = shallowMount(TableComponent, {
                    props: {
                        data: {}
                    }
                });

                expect(wrapper.vm.exportTable()).to.deep.equal(wrapper.vm.editedTable.items);
            });

            it("should return extended items if additional columns are passed", () => {
                const wrapper = shallowMount(TableComponent, {
                    props: {
                        data: {
                            headers: [{name: "Key_0", index: 0}],
                            items: [{Key_0: "Value_0"}]
                        },
                        additionalColumnsForDownload: [
                            {key: "Key_1", value: "Value_1"},
                            {key: "Key_2", value: "Value_2"}
                        ]
                    }
                });

                expect(wrapper.vm.exportTable()).to.deep.equal(
                    [
                        {
                            Key_0: "Value_0",
                            Key_1: "Value_1",
                            Key_2: "Value_2"
                        }
                    ]
                );
            });
        });
        describe("getIconClassByOrder", () => {
            it("should return 'bi-arrow-down-up origin-order' if sorting column name not equals current sorting name", () => {
                const wrapper = shallowMount(TableComponent, {
                        props: {
                            data: {}
                        }
                    }),
                    expected = "bi-arrow-down-up origin-order";

                wrapper.vm.currentSorting = {};
                expect(wrapper.vm.getIconClassByOrder("foo")).to.be.equals(expected);
            });
            it("should return 'bi-arrow-up' if current sorting order is asc", () => {
                const wrapper = shallowMount(TableComponent, {
                        props: {
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
                        props: {
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
                        props: {
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
        describe("getNextSortOrder", () => {
            it("should return 'desc' order when passed 'origin'", () => {
                const wrapper = shallowMount(TableComponent, {
                        props: {
                            data: {}
                        }
                    }),
                    order = wrapper.vm.getNextSortOrder("origin");

                expect(order).to.be.equal("desc");
            });

            it("should return 'asc' order when passed 'desc'", () => {
                const wrapper = shallowMount(TableComponent, {
                        props: {
                            data: {}
                        }
                    }),
                    order = wrapper.vm.getNextSortOrder("desc");

                expect(order).to.be.equal("asc");
            });

            it("should return 'origin' order when passed 'asc'", () => {
                const wrapper = shallowMount(TableComponent, {
                        props: {
                            data: {}
                        }
                    }),
                    order = wrapper.vm.getNextSortOrder("asc");

                expect(order).to.be.equal("origin");
            });
        });
        describe("getSortedItems", () => {
            it("should return the 'originItems' if the items are to be sorted in their origin order", () => {
                const wrapper = shallowMount(TableComponent, {
                        props: {
                            data: {
                                headers: [{name: "foo", index: 0}, {name: "bar", index: 1}, {name: "buz", index: 2}],
                                items: [
                                    ["foo", "bar", "buz"],
                                    ["fow", "bar", "buz"],
                                    ["fox", "bar", "buz"],
                                    ["foy", "bar", "buz"]
                                ]
                            }
                        }
                    }),
                    originRows = wrapper.vm.getSortedItems(wrapper.vm.data.items, "origin", "foo");

                expect(originRows).to.deep.equal(wrapper.vm.data.items);
            });
            it("should return the items in ascending order", () => {
                const wrapper = shallowMount(TableComponent, {
                        props: {
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
                        props: {
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
            it("should sort number strings by alphabet by default", () => {
                const wrapper = shallowMount(TableComponent, {
                        props: {
                            data: {}
                        },
                        global: {
                            plugins: [store]
                        }
                    }),
                    items = [{
                        "bar": "2"
                    },
                    {
                        "bar": "11"
                    },
                    {
                        "bar": "1"
                    }],
                    expectItems = [
                        {
                            "bar": "1"
                        },
                        {
                            "bar": "11"
                        },
                        {
                            "bar": "2"
                        }
                    ],
                    sortedItems = wrapper.vm.getSortedItems(items, "bar", "asc");

                expect(sortedItems).to.deep.equal(expectItems);
            });
            it("should sort number strings by their value if prop is set", () => {
                const wrapper = shallowMount(TableComponent, {
                        props: {
                            data: {},
                            sortByNumericValue: true
                        },
                        global: {
                            plugins: [store]
                        }
                    }),
                    items = [{
                        "bar": "2"
                    },
                    {
                        "bar": "11"
                    },
                    {
                        "bar": "1"
                    }],
                    expectItems = [
                        {
                            "bar": "1"
                        },
                        {
                            "bar": "2"
                        },
                        {
                            "bar": "11"
                        }
                    ],
                    sortedItems = wrapper.vm.getSortedItems(items, "bar", "asc");

                expect(sortedItems).to.deep.equal(expectItems);
            });
        });
        describe("runSorting", () => {
            it("should call expected functions", () => {
                const wrapper = shallowMount(TableComponent, {
                        props: {
                            data: {}
                        }
                    }),
                    getNextSortOrderStub = sinon.stub(wrapper.vm, "getNextSortOrder");

                wrapper.vm.runSorting("foo");
                expect(getNextSortOrderStub.called).to.be.true;
            });
            it("should set the sort order for the columns correctly", async () => {
                const wrapper = shallowMount(TableComponent, {
                    props: {
                        data: {}
                    }
                });

                await wrapper.vm.$nextTick();
                sinon.stub(wrapper.vm, "getSortedItems").returns([{foo: "bar"}]);
                await wrapper.setData({
                    currentSorting: {
                        columnName: "foo",
                        order: "origin"
                    },
                    visibleHeaders: [{
                        name: "foo"
                    }]
                });
                wrapper.vm.runSorting("foo");
                expect(wrapper.vm.currentSorting.order).to.be.equal("desc");
            });
            it("should set the sort order for the columns correctly", async () => {
                const wrapper = shallowMount(TableComponent, {
                    props: {
                        data: {}
                    }
                });

                await wrapper.vm.$nextTick();
                sinon.stub(wrapper.vm, "getSortedItems").returns([{foo: "bar"}]);
                await wrapper.setData({
                    currentSorting: {
                        columnName: "foo",
                        order: "desc"
                    },
                    visibleHeaders: [{
                        name: "foo"
                    }]
                });
                wrapper.vm.runSorting("foo");
                expect(wrapper.vm.currentSorting.order).to.be.equal("asc");
            });
            it("should set the sort order for the columns correctly", async () => {
                const wrapper = shallowMount(TableComponent, {
                    props: {
                        data: {}
                    }
                });

                await wrapper.vm.$nextTick();
                sinon.stub(wrapper.vm, "getSortedItems").returns([{foo: "bar"}]);
                await wrapper.setData({
                    currentSorting: {
                        columnName: "foo",
                        order: "asc"
                    },
                    visibleHeaders: [{
                        name: "foo"
                    }]
                });
                wrapper.vm.runSorting("foo");
                expect(wrapper.vm.currentSorting.order).to.be.equal("origin");
            });
        });
        describe("isHeaderVisible", () => {
            it("should return false if the parameter is not string", async () => {
                const wrapper = shallowMount(TableComponent, {
                    props: {
                        data: {}
                    }
                });

                await wrapper.vm.$nextTick();
                expect(wrapper.vm.isHeaderVisible(null)).to.be.false;
                expect(wrapper.vm.isHeaderVisible(0)).to.be.false;
                expect(wrapper.vm.isHeaderVisible(undefined)).to.be.false;
                expect(wrapper.vm.isHeaderVisible(true)).to.be.false;
                expect(wrapper.vm.isHeaderVisible({})).to.be.false;
                expect(wrapper.vm.isHeaderVisible([])).to.be.false;
            });

            it("should return false if there are no visible headers", async () => {
                const wrapper = shallowMount(TableComponent, {
                    props: {
                        data: {}
                    }
                });

                await wrapper.vm.$nextTick();
                await wrapper.setData({
                    visibleHeaders: []
                });
                expect(wrapper.vm.isHeaderVisible("a name")).to.be.false;
            });

            it("should return false if the parameter is not in visible header", async () => {
                const wrapper = shallowMount(TableComponent, {
                    props: {
                        data: {}
                    }
                });

                await wrapper.vm.$nextTick();
                await wrapper.setData({
                    visibleHeaders: [{
                        name: "foo"
                    }]
                });
                expect(wrapper.vm.isHeaderVisible("a name")).to.be.false;
            });

            it("should return true if the parameter is  in visible header", async () => {
                const wrapper = shallowMount(TableComponent, {
                    props: {
                        data: {}
                    }
                });

                await wrapper.vm.$nextTick();
                await wrapper.setData({
                    visibleHeaders: [{
                        name: "foo"
                    }]
                });
                expect(wrapper.vm.isHeaderVisible("foo")).to.be.true;
            });
        });
        describe("resetAll", () => {
            it("should set sorted data to origin order", async () => {
                const wrapper = shallowMount(TableComponent, {
                    props: {
                        data: {}
                    }
                });

                await wrapper.vm.$nextTick();
                await wrapper.setData({
                    currentSorting: {
                        columnName: "foo",
                        order: "asc"
                    },
                    visibleHeaders: [{
                        name: "foo"
                    }]
                });
                wrapper.vm.resetAll();
                expect(wrapper.vm.currentSorting.order).to.be.equal("origin");
            });
            it("should set all headers to origin order", async () => {
                const wrapper = shallowMount(TableComponent, {
                    props: {
                        data: {
                            headers: [
                                {name: "foo", index: 0},
                                {name: "bar", index: 1}
                            ]
                        }
                    }
                });

                await wrapper.vm.$nextTick();
                await wrapper.setData({
                    draggableHeader: [
                        {name: "bar", index: 1},
                        {name: "foo", index: 0}
                    ]
                });
                wrapper.vm.resetAll();
                expect(wrapper.vm.draggableHeader).to.be.deep.equal([{name: "foo", index: 0}, {name: "bar", index: 1}]);
            });
            it("should set all headers to visible", async () => {
                const wrapper = shallowMount(TableComponent, {
                    props: {
                        data: {
                            headers: [
                                {name: "foo", index: 0},
                                {name: "bar", index: 1}
                            ]
                        }
                    }
                });

                await wrapper.vm.$nextTick();
                await wrapper.setData({
                    visibleHeadersIndices: [0]
                });
                wrapper.vm.resetAll();
                expect(wrapper.vm.visibleHeadersIndices).to.be.deep.equal([0, 1]);
            });
            it("should toggle the fixed column", async () => {
                const wrapper = shallowMount(TableComponent, {
                    props: {
                        data: {
                            headers: [
                                {name: "foo", index: 0},
                                {name: "bar", index: 1}
                            ]
                        }
                    }
                });

                await wrapper.vm.$nextTick();
                await wrapper.setData({
                    fixedColumn: "foo"
                });
                expect(wrapper.vm.fixedColumn).to.be.equal("foo");
                await wrapper.setData({
                    visibleHeadersIndices: [1]
                });
                wrapper.vm.resetAll();
                expect(wrapper.vm.visibleHeadersIndices).to.be.deep.equal([0, 1]);
                expect(wrapper.vm.fixedColumn).to.be.undefined;
            });
        });
        describe("toggleColumnFix", () => {
            it("should not change fixedColumn if parameter is not type of string", async () => {
                const wrapper = shallowMount(TableComponent, {
                        props: {
                            data: {
                                headers: [
                                    {name: "foo", index: 0},
                                    {name: "bar", index: 1}
                                ]
                            }
                        }
                    }),
                    expected = "foo";

                await wrapper.vm.$nextTick();
                wrapper.vm.fixedColumn = expected;
                wrapper.vm.toggleColumnFix(undefined);
                expect(wrapper.vm.fixedColumn).to.be.equal(expected);
                wrapper.vm.toggleColumnFix(null);
                expect(wrapper.vm.fixedColumn).to.be.equal(expected);
                wrapper.vm.toggleColumnFix({});
                expect(wrapper.vm.fixedColumn).to.be.equal(expected);
                wrapper.vm.toggleColumnFix([]);
                expect(wrapper.vm.fixedColumn).to.be.equal(expected);
                wrapper.vm.toggleColumnFix(true);
                expect(wrapper.vm.fixedColumn).to.be.equal(expected);
                wrapper.vm.toggleColumnFix(false);
                expect(wrapper.vm.fixedColumn).to.be.equal(expected);
                wrapper.vm.toggleColumnFix(1234);
                expect(wrapper.vm.fixedColumn).to.be.equal(expected);
            });
            it("should not change fixedColumn if given string is not found in headers array", async () => {
                const wrapper = shallowMount(TableComponent, {
                        props: {
                            data: {
                                headers: [{name: "foo", index: 0}, {name: "bar", index: 1}]
                            }
                        }
                    }),
                    expected = "foo";

                await wrapper.vm.$nextTick();
                wrapper.vm.draggableHeader = [{name: "foo", index: 0}, {name: "bar", index: 1}];
                wrapper.vm.fixedColumn = expected;
                wrapper.vm.toggleColumnFix("buz");
                expect(wrapper.vm.fixedColumn).to.be.equal(expected);
            });
            it("should set fixedColumn to undefined if the same column is give", async () => {
                const wrapper = shallowMount(TableComponent, {
                        props: {
                            data: {
                                headers: [
                                    {name: "foo", index: 0},
                                    {name: "bar", index: 1}
                                ]
                            }
                        }
                    }),
                    column = "foo";

                await wrapper.vm.$nextTick();
                wrapper.vm.fixedColumn = column;
                wrapper.vm.toggleColumnFix(column);
                expect(wrapper.vm.fixedColumn).to.be.undefined;
            });
            it("should set fixedColumns to given columnName", async () => {
                const wrapper = shallowMount(TableComponent, {
                        props: {
                            data: {
                                headers: [
                                    {name: "foo", index: 0},
                                    {name: "bar", index: 1}
                                ]
                            }
                        }
                    }),
                    column = "foo";

                await wrapper.vm.$nextTick();
                sinon.stub(wrapper.vm, "moveColumnToFirstPlace");
                wrapper.vm.toggleColumnFix(column);
                expect(wrapper.vm.fixedColumn).to.be.equal(column);
                sinon.restore();
            });
        });
        describe("moveColumnToFirstPlace", () => {
            it("should not update the draggableHeaders if parameter is not type of string", async () => {
                const wrapper = shallowMount(TableComponent, {
                        props: {
                            data: {}
                        },
                        data: () => {
                            return {
                                draggableHeader: []
                            };
                        }
                    }),
                    expected = wrapper.vm.draggableHeader;

                await wrapper.vm.$nextTick();
                wrapper.vm.moveColumnToFirstPlace(undefined);
                expect(wrapper.vm.draggableHeader).to.deep.equal(expected);
                wrapper.vm.moveColumnToFirstPlace(null);
                expect(wrapper.vm.draggableHeader).to.deep.equal(expected);
                wrapper.vm.moveColumnToFirstPlace({});
                expect(wrapper.vm.draggableHeader).to.deep.equal(expected);
                wrapper.vm.moveColumnToFirstPlace([]);
                expect(wrapper.vm.draggableHeader).to.deep.equal(expected);
                wrapper.vm.moveColumnToFirstPlace(true);
                expect(wrapper.vm.draggableHeader).to.deep.equal(expected);
                wrapper.vm.moveColumnToFirstPlace(false);
                expect(wrapper.vm.draggableHeader).to.deep.equal(expected);
                wrapper.vm.moveColumnToFirstPlace(1234);
                expect(wrapper.vm.draggableHeader).to.deep.equal(expected);
            });
            it("should update the draggableHeader as expected", async () => {
                const wrapper = shallowMount(TableComponent, {
                    props: {
                        data: {
                            headers: [{name: "foo", index: 0}, {name: "bar", index: 1}, {name: "buz", index: 2}],
                            items: [
                                ["foo", "bar", "buz"],
                                ["foo", "bar", "buz"],
                                ["foo", "bar", "buz"],
                                ["foo", "bar", "buz"]
                            ]
                        }
                    }
                });

                await wrapper.vm.$nextTick();
                wrapper.vm.draggableHeader = [{name: "foo", index: 0}, {name: "bar", index: 1}, {name: "buz", index: 2}];
                wrapper.vm.moveColumnToFirstPlace("bar");
                expect(wrapper.vm.draggableHeader).to.deep.equal([{name: "bar", index: 0}, {name: "foo", index: 1}, {name: "buz", index: 2}]);
            });
        });
        describe("preventMoveAboveFixedColumn", () => {
            it("should return false if fixedColumn is set and futureIndex is 0", async () => {
                const wrapper = shallowMount(TableComponent, {
                    props: {
                        data: {}
                    }
                });

                await wrapper.vm.$nextTick();
                wrapper.vm.fixedColumn = "foo";
                expect(wrapper.vm.preventMoveAboveFixedColumn({draggedContext: {futureIndex: 0}})).to.be.false;
            });
            it("should return true", async () => {
                const wrapper = shallowMount(TableComponent, {
                    props: {
                        data: {}
                    }
                });

                await wrapper.vm.$nextTick();
                wrapper.vm.fixedColumn = "foo";
                expect(wrapper.vm.preventMoveAboveFixedColumn({draggedContext: {futureIndex: 1}})).to.be.true;
                wrapper.vm.fixedColumn = null;
                expect(wrapper.vm.preventMoveAboveFixedColumn({draggedContext: {futureIndex: 0}})).to.be.true;
            });
        });
        describe("getUniqueValuesByColumnName", async () => {
            const wrapper = shallowMount(TableComponent, {
                props: {
                    data: {
                        headers: [{name: "foo", index: 0}, {name: "bar", index: 1}, {name: "buz", index: 2}],
                        items: [
                            ["foo", "bar", "buz"]
                        ]
                    }
                }
            });

            await wrapper.vm.$nextTick();

            it("should return an empty array if first param is not a string", () => {
                expect(wrapper.vm.getUniqueValuesByColumnName(undefined)).to.deep.equal([]);
                expect(wrapper.vm.getUniqueValuesByColumnName(null)).to.deep.equal([]);
                expect(wrapper.vm.getUniqueValuesByColumnName({})).to.deep.equal([]);
                expect(wrapper.vm.getUniqueValuesByColumnName([])).to.deep.equal([]);
                expect(wrapper.vm.getUniqueValuesByColumnName(true)).to.deep.equal([]);
                expect(wrapper.vm.getUniqueValuesByColumnName(false)).to.deep.equal([]);
                expect(wrapper.vm.getUniqueValuesByColumnName(1234)).to.deep.equal([]);
            });

            it("should return an empty array if second param is not an array", () => {
                expect(wrapper.vm.getUniqueValuesByColumnName("foo", {})).to.deep.equal([]);
                expect(wrapper.vm.getUniqueValuesByColumnName("foo", "string")).to.deep.equal([]);
                expect(wrapper.vm.getUniqueValuesByColumnName("foo", 1234)).to.deep.equal([]);
                expect(wrapper.vm.getUniqueValuesByColumnName("foo", true)).to.deep.equal([]);
                expect(wrapper.vm.getUniqueValuesByColumnName("foo", false)).to.deep.equal([]);
                expect(wrapper.vm.getUniqueValuesByColumnName("foo", undefined)).to.deep.equal([]);
                expect(wrapper.vm.getUniqueValuesByColumnName("foo", null)).to.deep.equal([]);
            });

            it("should return an empty array if second param is an empty array", () => {
                expect(wrapper.vm.getUniqueValuesByColumnName("foo", [])).to.deep.equal([]);
            });

            it("should return an empty array if given head is not found in objects of the array", () => {
                const rows = [
                        {
                            foo: "bar",
                            fuz: "buz"
                        },
                        {
                            foo: "bar",
                            fuz: "buz"
                        }
                    ],
                    head = "fow";

                expect(wrapper.vm.getUniqueValuesByColumnName(head, rows)).to.deep.equal([]);
            });

            it("should return an array with keys as strings", () => {
                const rows = [
                        {
                            foo: "bar",
                            fuz: "buz"
                        },
                        {
                            foo: "bar",
                            fuz: "buz"
                        }
                    ],
                    head = "foo";

                expect(wrapper.vm.getUniqueValuesByColumnName(head, rows)).to.deep.equal(["bar"]);
            });
        });
        describe("addFilter", async () => {
            const wrapper = shallowMount(TableComponent, {
                props: {
                    data: {
                        headers: [{name: "foo", index: 0}, {name: "bar", index: 1}, {name: "buz", index: 2}],
                        items: [
                            ["foo", "bar", "buz"]
                        ]
                    }
                }
            });

            await wrapper.vm.$nextTick();
            it("should not update the filterObject property", () => {
                const copy = JSON.parse(JSON.stringify(wrapper.vm.filterObject));

                wrapper.vm.addFilter();
                expect(wrapper.vm.filterObject).to.deep.equal(copy);
            });

            it("should update the filterObject property", () => {
                const result = {foo: {bar: true}};

                wrapper.vm.addFilter("bar", "foo");
                expect(wrapper.vm.filterObject).to.deep.equal(result);
            });
        });
        describe("removeFilter", async () => {
            const wrapper = shallowMount(TableComponent, {
                props: {
                    data: {
                        headers: [{name: "foo", index: 0}, {name: "bar", index: 1}, {name: "buz", index: 2}],
                        items: [
                            ["foo", "bar", "buz"]
                        ]
                    }
                }
            });

            await wrapper.vm.$nextTick();
            it("should not update the filterObject property", () => {
                const copy = JSON.parse(JSON.stringify(wrapper.vm.filterObject));

                wrapper.vm.removeFilter();
                expect(wrapper.vm.filterObject).to.deep.equal(copy);
            });

            it("should update the filterObject property", () => {
                const result = {foo: {bar: true}};

                wrapper.vm.filterObject = {foo: {bar: true, buz: true}};
                wrapper.vm.removeFilter("buz", "foo");
                expect(wrapper.vm.filterObject).to.deep.equal(result);
            });
        });
        describe("getFilteredRows", async () => {
            const wrapper = shallowMount(TableComponent, {
                props: {
                    data: {
                        headers: [{name: "foo", index: 0}, {name: "bar", index: 1}, {name: "buz", index: 2}],
                        items: [
                            ["foo", "bar", "buz"]
                        ]
                    }
                }
            });

            await wrapper.vm.$nextTick();
            it("should return an empty array if first param is not an object", () => {
                expect(wrapper.vm.getFilteredRows(undefined)).to.be.an("array").and.to.be.empty;
                expect(wrapper.vm.getFilteredRows(null)).to.be.an("array").and.to.be.empty;
                expect(wrapper.vm.getFilteredRows(true)).to.be.an("array").and.to.be.empty;
                expect(wrapper.vm.getFilteredRows(false)).to.be.an("array").and.to.be.empty;
                expect(wrapper.vm.getFilteredRows("string")).to.be.an("array").and.to.be.empty;
                expect(wrapper.vm.getFilteredRows(1234)).to.be.an("array").and.to.be.empty;
                expect(wrapper.vm.getFilteredRows([])).to.be.an("array").and.to.be.empty;
            });

            it("should return an empty array if the second param is not an array", () => {
                expect(wrapper.vm.getFilteredRows({}, undefined)).to.be.an("array").and.to.be.empty;
                expect(wrapper.vm.getFilteredRows({}, null)).to.be.an("array").and.to.be.empty;
                expect(wrapper.vm.getFilteredRows({}, {})).to.be.an("array").and.to.be.empty;
                expect(wrapper.vm.getFilteredRows({}, true)).to.be.an("array").and.to.be.empty;
                expect(wrapper.vm.getFilteredRows({}, false)).to.be.an("array").and.to.be.empty;
                expect(wrapper.vm.getFilteredRows({}, "string")).to.be.an("array").and.to.be.empty;
                expect(wrapper.vm.getFilteredRows({}, 1234)).to.be.an("array").and.to.be.empty;
            });

            it("should return an array of found elements", () => {
                const filterObject = {foo: {bar: true}},
                    rows = [
                        {foo: "bar", fow: "wow"},
                        {foo: "baz", fow: "wow"}
                    ],
                    expected = [{foo: "bar", fow: "wow"}];

                expect(wrapper.vm.getFilteredRows(filterObject, rows)).to.deep.equals(expected);
            });
            it("should return an array of found elements", () => {
                const filterObject = {foo: {bar: true}, fow: {wow: true}},
                    rows = [
                        {foo: "bar", fow: "wow"},
                        {foo: "bar", fow: "pow"},
                        {foo: "baz", fow: "wow"}
                    ],
                    expected = [{foo: "bar", fow: "wow"}];

                expect(wrapper.vm.getFilteredRows(filterObject, rows)).to.deep.equals(expected);
            });
            it("should return an empty array if no elements found", () => {
                const filterObject = {foob: {bar: true}, foww: {wow: true}},
                    rows = [
                        {foo: "bar", fow: "wow"},
                        {foo: "bar", fow: "pow"},
                        {foo: "baz", fow: "wow"}
                    ];

                expect(wrapper.vm.getFilteredRows(filterObject, rows)).to.be.an("array").and.to.be.empty;
            });
        });
        describe("checkTotalHint", async () => {
            const wrapper = shallowMount(TableComponent, {
                props: {
                    data: {}
                },
                global: {
                    plugins: [store]
                }
            });

            await wrapper.vm.$nextTick();
            it("should return false if there is no hint text", () => {
                expect(wrapper.vm.checkTotalHint(true, true)).to.be.false;
                expect(wrapper.vm.checkTotalHint(false, true)).to.be.false;
            });

            it("should return false if the hint text is not string", () => {
                expect(wrapper.vm.checkTotalHint({hintText: {}})).to.be.false;
                expect(wrapper.vm.checkTotalHint({hintText: false})).to.be.false;
                expect(wrapper.vm.checkTotalHint({hintText: []})).to.be.false;
                expect(wrapper.vm.checkTotalHint({hintText: 0})).to.be.false;
                expect(wrapper.vm.checkTotalHint({hintText: undefined})).to.be.false;
            });

            it("should return false if the total data is not shown", () => {
                expect(wrapper.vm.checkTotalHint({hintText: "test"}, false)).to.be.false;
                expect(wrapper.vm.checkTotalHint({hintText: "test"}, false)).to.be.false;
            });

            it("should return true", () => {
                expect(wrapper.vm.checkTotalHint({hintText: "test"}, true)).to.be.true;
            });
        });
        describe("getTotalData", () => {
            it("should return empty array", async () => {
                const wrapper = shallowMount(TableComponent, {
                    props: {
                        data: {}
                    }
                });

                await wrapper.vm.$nextTick();
                expect(wrapper.vm.getTotalData(false)).to.deep.equal([]);
                expect(wrapper.vm.getTotalData({enabled: false})).to.deep.equal([]);
            });

            it("should return total data", async () => {
                const wrapper = shallowMount(TableComponent, {
                        props: {
                            data: {}
                        },
                        global: {
                            plugins: [store]
                        }
                    }),
                    data = {
                        headers: [{name: "foo", index: 0}, {name: "bar", index: 1}, {name: "buz", index: 2}],
                        items: [
                            {foo: "Total", bar: 1, buz: 1},
                            {foo: "Total", bar: 2, buz: 2},
                            {foo: "Total", bar: 3, buz: 3}
                        ]
                    },
                    totalProp = {
                        enabled: true,
                        rowTitle: true,
                        hintText: ""
                    };

                await wrapper.setData({firstColumnName: "foo"});

                await wrapper.vm.$nextTick();
                expect(wrapper.vm.getTotalData(totalProp, data)).to.deep.equal(
                    ["common:shared.modules.table.total", 6, 6]
                );
            });
        });
        describe("getClassForSelectedColumn", () => {
            it("should return an empty string", async () => {
                const wrapper = shallowMount(TableComponent, {
                    props: {
                        data: {
                            headers: [{name: "foo", index: 0}, {name: "bar", index: 1}, {name: "buz", index: 2}],
                            items: [
                                {foo: "Total", bar: 1, buz: 1},
                                {foo: "Total", bar: 2, buz: 2},
                                {foo: "Total", bar: 3, buz: 3}
                            ]
                        }
                    },
                    global: {
                        plugins: [store]
                    }
                });

                await wrapper.vm.$nextTick();
                expect(wrapper.vm.getClassForSelectedColumn(0)).to.be.equal("");
            });
            it("should return an string containing 'selected'", async () => {
                const wrapper = shallowMount(TableComponent, {
                    props: {
                        data: {
                            headers: [{name: "foo", index: 0}, {name: "bar", index: 1}, {name: "buz", index: 2}],
                            items: [
                                {foo: "Total", bar: 1, buz: 1},
                                {foo: "Total", bar: 2, buz: 2},
                                {foo: "Total", bar: 3, buz: 3}
                            ]
                        }
                    },
                    global: {
                        plugins: [store]
                    }
                });

                await wrapper.vm.$nextTick();
                wrapper.vm.selectedColumn = "foo";
                await wrapper.vm.$nextTick();
                expect(wrapper.vm.getClassForSelectedColumn(0)).to.be.equal("selected");
            });
        });
    });
});
