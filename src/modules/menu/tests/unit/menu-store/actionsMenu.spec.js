import {expect} from "chai";
import sinon from "sinon";
import {nextTick} from "vue";
import actions from "../../../menu-store/actionsMenu";

describe("src/modules/menu/menu-store/actionsMenu.js", () => {
    let commit,
        dispatch,
        getters,
        state,
        rootGetters;

    beforeEach(() => {
        state = {
            currentMouseMapInteractionsComponent: "getFeatureInfo",
            defaultComponent: "getFeatureInfo",
            mainMenu: {
                expanded: false,
                currentComponent: "root",
                title: null,
                toggleButtonIcon: "bi-list",
                sections: [[]],
                navigation: {
                    currentComponent: {
                        type: "root",
                        props: []
                    },
                    history: []
                }
            },
            secondaryMenu: {
                expanded: false,
                currentComponent: "root",
                sections: [[]],
                title: null,
                toggleButtonIcon: "bi-tools",
                navigation: {
                    currentComponent: {
                        type: "root",
                        props: []
                    },
                    history: []
                }
            }
        };
        commit = sinon.spy();
        dispatch = sinon.spy();
        getters = {
            currentComponent: () => {
                return {
                    type: "abc"
                };
            }
        };
        rootGetters = {
            "Modules/Abc/hasMouseMapInteractions": () => true,
            "Modules/SearchBar/showAllResults": () => false,
            "Modules/FileImport/name": "File Import",
            isMobile: false
        };
        global.window.open = sinon.spy();
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("activateCurrentComponent", () => {
        it("should activate current component and expand the menu side", () => {
            const currentComponent = {
                    type: "fileImport"
                },
                side = "mainMenu",
                type = "FileImport";

            actions.activateCurrentComponent({commit, dispatch, rootGetters}, {currentComponent, type, side});

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args[0]).to.equals("setExpandedBySide");
            expect(commit.firstCall.args[1]).to.deep.equals({
                expanded: true,
                side: side
            });
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equals("changeCurrentComponent");
            expect(dispatch.firstCall.args[1]).to.deep.equals({
                type: currentComponent.type,
                side: side,
                props: {
                    name: "File Import"
                }
            });
        });
    });

    describe("changeCurrentComponent", () => {
        it("should set current component and change current map interactions component", () => {
            const type = "abc",
                side = "mainMenu",
                props = {
                    name: "common:modules.menu.abc"
                };

            actions.changeCurrentComponent({commit, dispatch, state}, {type, side, props});

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args[0]).to.equals("setCurrentComponent");
            expect(commit.firstCall.args[1]).to.deep.equals({type, side, props});
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equals("changeCurrentMouseMapInteractionsComponent");
            expect(dispatch.firstCall.args[1]).to.deep.equals({type, side});
        });

        it("should setCurrentComponentProps, if only props name changed", () => {
            const type = "abc",
                side = "mainMenu",
                props = {
                    name: "common:menu.abc"
                };

            state[side].navigation.currentComponent.type = type;
            actions.changeCurrentComponent({commit, dispatch, state}, {type, side, props});

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args[0]).to.equals("setCurrentComponentProps");
            expect(commit.firstCall.args[1]).to.deep.equals({side, props});
            expect(dispatch.notCalled).to.be.true;
        });
    });

    describe("changeCurrentMouseMapInteractionsComponent", () => {
        it("should set current map interactions component", () => {
            const type = "abc",
                side = "mainMenu";

            actions.changeCurrentMouseMapInteractionsComponent({commit, rootGetters, state}, {type, side});

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args[0]).to.equals("setCurrentMouseMapInteractionsComponent");
            expect(commit.firstCall.args[1]).to.equals(type);
        });

        it("should switch secondaryMenu to root and set current map interactions component", () => {
            const type = "abc",
                side = "mainMenu";

            Object.assign(state, {
                secondaryMenu: {
                    navigation: {
                        currentComponent: {
                            type: "getFeatureInfo",
                            props: {
                                name: "common:gfi"
                            }
                        },
                        history: []
                    }
                }
            });

            actions.changeCurrentMouseMapInteractionsComponent({commit, rootGetters, state}, {type, side});

            expect(commit.calledTwice).to.be.true;
            expect(commit.firstCall.args[0]).to.equals("switchToRoot");
            expect(commit.firstCall.args[1]).to.equals("secondaryMenu");
            expect(commit.secondCall.args[0]).to.equals("setCurrentMouseMapInteractionsComponent");
            expect(commit.secondCall.args[1]).to.equals(type);
        });
    });

    describe("clickedMenuElement", () => {
        const name = "common:abc",
            path = ["generic"],
            side = "mainMenu";
        let type,
            properties;

        it("should change current component without path", () => {
            type = "abc";

            actions.clickedMenuElement({dispatch, rootGetters}, {name, path, side, type});

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equal("changeCurrentComponent");
            expect(dispatch.firstCall.args[1]).to.deep.equal({type: type, side: side, props: {name: name}});
        });

        it("should change current component with path for type === 'folder'", async () => {
            type = "folder";

            actions.clickedMenuElement({dispatch, rootGetters}, {name, path, side, type});

            await nextTick(() => {
                expect(dispatch.calledOnce).to.be.true;
                expect(dispatch.firstCall.args[0]).to.equal("changeCurrentComponent");
                expect(dispatch.firstCall.args[1]).to.deep.equal({type: type, side: side, props: {path: path, name: name}});
            });
        });

        it("should open new tab if type is 'customMenuElement' and properties contains 'openURL'", () => {
            type = "customMenuElement";
            properties = {
                openURL: "http://url.de"
            };

            actions.clickedMenuElement({dispatch, rootGetters}, {name, path, side, type, properties});

            expect(dispatch.notCalled).to.be.true;
            expect(global.window.open.calledOnce).to.be.true;
            expect(global.window.open.firstCall.args[0]).to.equal(properties.openURL);
        });

        it("should open new tab if type is 'customMenuElement' and properties contains 'openURL' and 'execute", () => {
            type = "customMenuElement";
            properties = {
                openURL: "http://url.de",
                execute: {
                    action: "Alerting/addSingleAlert",
                    payload: {"title": "An alle Menschen", "content": "Hallo Welt"}
                }
            };

            actions.clickedMenuElement({dispatch, rootGetters}, {name, path, side, type, properties});

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equal(properties.execute.action);
            expect(dispatch.firstCall.args[1]).to.be.deep.equal(properties.execute.payload);
            expect(dispatch.firstCall.args[2]).to.be.deep.equal({root: true});
            expect(global.window.open.calledOnce).to.be.true;
            expect(global.window.open.firstCall.args[0]).to.equal(properties.openURL);
        });

        it("should execute action if type is 'customMenuElement' and properties contains only 'execute", () => {
            type = "customMenuElement";
            properties = {
                execute: {
                    action: "Alerting/addSingleAlert",
                    payload: {"title": "An alle Menschen", "content": "Hallo Welt"}
                }
            };

            actions.clickedMenuElement({dispatch, rootGetters}, {name, path, side, type, properties});

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equal(properties.execute.action);
            expect(dispatch.firstCall.args[1]).to.be.deep.equal(properties.execute.payload);
            expect(dispatch.firstCall.args[2]).to.be.deep.equal({root: true});
        });

        it("mobile: should execute action if type is 'customMenuElement' and properties contains only execute, closes menu", () => {
            rootGetters.isMobile = true;
            type = "customMenuElement";
            properties = {
                execute: {
                    action: "Alerting/addSingleAlert",
                    payload: {"title": "An alle Menschen", "content": "Hallo Welt"}
                }
            };

            actions.clickedMenuElement({dispatch, rootGetters}, {name, path, side, type, properties});

            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equal(properties.execute.action);
            expect(dispatch.firstCall.args[1]).to.be.deep.equal(properties.execute.payload);
            expect(dispatch.firstCall.args[2]).to.be.deep.equal({root: true});
            expect(dispatch.secondCall.args[0]).to.equal("Menu/toggleMenu");
            expect(dispatch.secondCall.args[1]).to.equal(side);
            expect(dispatch.secondCall.args[2]).to.be.deep.equal({root: true});
        });

        it("mobile: should open new tab if type is 'customMenuElement' and properties contains 'openURL', closes menu", () => {
            rootGetters.isMobile = true;
            type = "customMenuElement";
            properties = {
                openURL: "http://url.de"
            };

            actions.clickedMenuElement({dispatch, rootGetters}, {name, path, side, type, properties});

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equal("Menu/toggleMenu");
            expect(dispatch.firstCall.args[1]).to.equal(side);
            expect(dispatch.firstCall.args[2]).to.be.deep.equal({root: true});
            expect(global.window.open.calledOnce).to.be.true;
            expect(global.window.open.firstCall.args[0]).to.equal(properties.openURL);
        });
    });

    describe("navigateBack", () => {
        let side = "mainMenu";

        it("should switch to previous component", async () => {
            rootGetters = {
                "Modules/SearchBar/showAllResults": false,
                "Modules/SearchBar/globalPlaceholder": "placeholder"
            };
            getters = {
                currentComponent: () => {
                    return {
                        type: "searchbar"
                    };
                }
            };

            actions.navigateBack({commit, dispatch, getters, state, rootGetters}, side);

            await nextTick(() => {
                expect(commit.calledThrice).to.be.true;
                expect(commit.firstCall.args[0]).to.equal("switchToPreviousComponent");
                expect(commit.firstCall.args[1]).to.equal(side);
                expect(commit.secondCall.args[0]).to.equal("Modules/SearchBar/setShowInTree");
                expect(commit.secondCall.args[1]).to.equal(false);
                expect(commit.thirdCall.args[0]).to.equal("Modules/SearchBar/setPlaceholder");
                expect(commit.thirdCall.args[1]).to.equal("placeholder");

                expect(dispatch.calledTwice).to.be.true;
                expect(dispatch.firstCall.args[0]).to.equal("Modules/SearchBar/updateSearchNavigation");
                expect(dispatch.firstCall.args[1]).to.equal(side);
                expect(dispatch.secondCall.args[0]).to.equal("handleActionButtons");
                expect(dispatch.secondCall.args[1]).to.deep.equal({side: side, searchValue: undefined});
            });
        });

        it("should switch to previous component and change current mouse map interactionscomponent'", async () => {
            Object.assign(state, {currentMouseMapInteractionsComponent: "abc"});

            rootGetters = {"Modules/SearchBar/showAllResults": false};

            actions.navigateBack({commit, dispatch, getters, state, rootGetters}, side);

            await nextTick(() => {
                expect(commit.calledTwice).to.be.true;
                expect(commit.firstCall.args[0]).to.equal("switchToPreviousComponent");
                expect(commit.firstCall.args[1]).to.equal(side);
                expect(commit.secondCall.args[0]).to.equal("Modules/SearchBar/setShowInTree");
                expect(commit.secondCall.args[1]).to.equal(false);

                expect(dispatch.calledTwice).to.be.true;
                expect(dispatch.firstCall.args[0]).to.equal("changeCurrentMouseMapInteractionsComponent");
                expect(dispatch.firstCall.args[1]).to.deep.equal({type: state.defaultComponent, side});
                expect(dispatch.secondCall.args[0]).to.equal("handleActionButtons");
                expect(dispatch.secondCall.args[1]).to.deep.equal({side: side, searchValue: undefined});
            });
        });

        it("should switch to previous component if searchbar showAllResults=true but on other menu side", async () => {
            Object.assign(state, {currentMouseMapInteractionsComponent: "abc"});
            side = "secondaryMenu";
            rootGetters = {
                "Modules/SearchBar/showAllResults": true,
                "Modules/SearchBar/currentSide": "mainMenu"
            };

            actions.navigateBack({commit, dispatch, getters, state, rootGetters}, side);

            await nextTick(() => {
                expect(commit.calledTwice).to.be.true;
                expect(commit.firstCall.args[0]).to.equal("switchToPreviousComponent");
                expect(commit.firstCall.args[1]).to.equal(side);
                expect(commit.secondCall.args[0]).to.equal("Modules/SearchBar/setShowInTree");
                expect(commit.secondCall.args[1]).to.equal(false);

                expect(dispatch.calledTwice).to.be.true;
                expect(dispatch.firstCall.args[0]).to.equal("changeCurrentMouseMapInteractionsComponent");
                expect(dispatch.firstCall.args[1]).to.deep.equal({type: state.defaultComponent, side});
                expect(dispatch.secondCall.args[0]).to.equal("handleActionButtons");
                expect(dispatch.secondCall.args[1]).to.deep.equal({side: side, searchValue: undefined});
            });
        });
    });
    describe("handleActionButtons", () => {
        const side = "mainMenu";

        it("should update searchbar navigation from layerinformation within main search", async () => {
            rootGetters = {"Modules/SearchBar/Modules/SearchBar/searchInput": "",
                "Modules/SearchBar/searchInput": "Neue"
            };
            getters = {
                currentComponent: () => {
                    return {
                        type: "layerInformation"
                    };
                },
                navigationHistory: () => {
                    return [
                        {type: "root"},
                        {type: "searchBar"},
                        {type: "searchBar"}
                    ];
                }
            };

            actions.handleActionButtons({commit, dispatch, getters, rootGetters}, {side: side, searchValue: "Neue"});

            await nextTick(() => {
                expect(commit.calledTwice).to.be.true;
                expect(commit.firstCall.args[0]).to.equal("switchToPreviousComponent");
                expect(commit.firstCall.args[1]).to.equal(side);
                expect(commit.secondCall.args[0]).to.equal("Modules/SearchBar/setSearchInput");
                expect(commit.secondCall.args[1]).to.equal("Neue");

                expect(dispatch.calledOnce).to.be.true;
                expect(dispatch.firstCall.args[0]).to.equal("Modules/SearchBar/updateSearchNavigation");
                expect(dispatch.firstCall.args[1]).to.equal(side);
            });
        });
        it("should update searchbar navigation from layerSelection", async () => {
            rootGetters = {
                "Modules/SearchBar/searchInput": "Neue"
            };
            getters = {
                currentComponent: () => {
                    return {
                        type: "layerSelection"
                    };
                },
                navigationHistory: () => {
                    return [
                        {type: "root"},
                        {type: "layerSelction"}
                    ];
                }
            };

            actions.handleActionButtons({commit, dispatch, getters, rootGetters}, {side: side});

            await nextTick(() => {
                expect(commit.calledTwice).to.be.true;
                expect(commit.firstCall.args[0]).to.equal("Modules/SearchBar/setSearchInput");
                expect(commit.firstCall.args[1]).to.equal("");
                expect(commit.secondCall.args[0]).to.equal("Modules/SearchBar/setCurrentSearchInputValue");
                expect(commit.secondCall.args[1]).to.equal("");
                expect(dispatch.calledTwice).to.be.true;
                expect(dispatch.firstCall.args[0]).to.equal("Modules/SearchBar/updateSearchNavigation");
                expect(dispatch.firstCall.args[1]).to.equal(side);
                expect(dispatch.secondCall.args[0]).to.equal("navigateBack");
                expect(dispatch.secondCall.args[1]).to.equal(side);
            });
        });
    });

    describe("toggleMenu", () => {
        it("should set main menu to expanded === true", () => {
            const side = "mainMenu";

            actions.toggleMenu({commit, rootGetters, state}, side);

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args[0]).to.equal("setExpandedBySide");
            expect(commit.firstCall.args[1]).to.deep.equal({
                expanded: true,
                side
            });
        });
        it("should set secondary menu to expanded === true", () => {
            const side = "secondaryMenu";

            actions.toggleMenu({commit, rootGetters, state}, side);

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args[0]).to.equal("setExpandedBySide");
            expect(commit.firstCall.args[1]).to.deep.equal({
                expanded: true,
                side
            });
        });
        it("should set main menu to expanded === true, if isMobile is true and secodary menu is not expanded === false", () => {
            const side = "secondaryMenu";

            rootGetters.isMobile = true;
            actions.toggleMenu({commit, rootGetters, state}, side);

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args[0]).to.equal("setExpandedBySide");
            expect(commit.firstCall.args[1]).to.deep.equal({
                expanded: true,
                side
            });
        });
        it("should set main menu to expanded === false, if isMobile is true and secodary menu is expanded === true", () => {
            const side = "secondaryMenu";

            state.secondaryMenu.expanded = true;
            rootGetters.isMobile = true;
            actions.toggleMenu({commit, rootGetters, state}, side);

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args[0]).to.equal("setExpandedBySide");
            expect(commit.firstCall.args[1]).to.deep.equal({
                expanded: false,
                side
            });
        });
    });

    describe("closeMenu", () => {
        const side = "mainMenu";

        it("should close and reset MenuContainer", async () => {
            actions.closeMenu({commit, dispatch, getters, state}, side);

            await nextTick(() => {
                expect(commit.calledOnce).to.be.true;
                expect(commit.firstCall.args[0]).to.equal("switchToRoot");
                expect(commit.firstCall.args[1]).to.equal(side);
                expect(dispatch.calledOnce).to.be.true;
                expect(dispatch.firstCall.args[0]).to.equal("toggleMenu");
                expect(dispatch.firstCall.args[1]).to.equal(side);
            });
        });

    });

    describe("resetMenu", () => {
        let side = "mainMenu";

        it("should switch to Root but not change Interaction if already GFI", async () => {
            rootGetters["Modules/SearchBar/currentSide"] = side;
            actions.resetMenu({commit, dispatch, getters, rootGetters, state}, side);

            await nextTick(() => {
                expect(dispatch.calledOnce).to.be.true;
                expect(dispatch.firstCall.args[0]).to.equal("Modules/SearchBar/updateSearchNavigation");
                expect(dispatch.firstCall.args[1]).to.equal(side);
                expect(commit.calledOnce).to.be.true;
                expect(commit.firstCall.args[0]).to.equal("switchToRoot");
                expect(commit.firstCall.args[1]).to.equal(side);
            });
        });

        it("should switch to Root and change Interaction if not already GFI", async () => {
            Object.assign(state, {currentMouseMapInteractionsComponent: "abc"});
            rootGetters["Modules/SearchBar/currentSide"] = side;

            actions.resetMenu({commit, dispatch, getters, rootGetters, state}, side);

            await nextTick(() => {
                expect(dispatch.calledTwice).to.be.true;
                expect(dispatch.firstCall.args[0]).to.equal("changeCurrentMouseMapInteractionsComponent");
                expect(dispatch.firstCall.args[1]).to.deep.equal({type: state.defaultComponent, side});
                expect(dispatch.secondCall.args[0]).to.equal("Modules/SearchBar/updateSearchNavigation");
                expect(dispatch.secondCall.args[1]).to.equal(side);
                expect(commit.calledOnce).to.be.true;
                expect(commit.firstCall.args[0]).to.equal("switchToRoot");
                expect(commit.firstCall.args[1]).to.equal(side);
            });
        });

        it("should switch to Root but not change searchNAvigation, if search is on other side", async () => {
            rootGetters["Modules/SearchBar/currentSide"] = "mainMenu";
            side = "secondaryMenu";
            actions.resetMenu({commit, dispatch, getters, rootGetters, state}, side);

            await nextTick(() => {
                expect(dispatch.notCalled).to.be.true;
                expect(commit.calledOnce).to.be.true;
                expect(commit.firstCall.args[0]).to.equal("switchToRoot");
                expect(commit.firstCall.args[1]).to.equal(side);
            });
        });
    });
});
