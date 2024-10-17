import sinon from "sinon";
import {expect} from "chai";
import gettersMenu from "../../../menu-store/gettersMenu";
import stateMenu from "../../../menu-store/stateMenu";
import idx from "../../../../../shared/js/utils/idx";

describe("src/modules/menu/menu-store/gettersMenu.js", () => {
    const mainMenuSymbol = Symbol("mainMenu"),
        secondaryMenuSymbol = Symbol("secondaryMenu");
    let consoleErrorSpy,
        getters,
        rootGetters,
        rootState,
        state;

    beforeEach(() => {
        consoleErrorSpy = sinon.spy();
        sinon.stub(console, "error").callsFake(consoleErrorSpy);
        state = {
            mainMenu: mainMenuSymbol,
            secondaryMenu: secondaryMenuSymbol
        };
        getters = {
            mainMenu: null,
            secondaryMenu: null
        };
        rootGetters = {
            loadedConfigs: {
                configJson: false
            },
            portalConfig: {
                mainMenu: mainMenuSymbol,
                secondaryMenu: secondaryMenuSymbol
            },
            "Menu/Navigation/lastEntry": sinon.stub()
        };
    });

    afterEach(sinon.restore);

    describe("currentComponent", () => {
        beforeEach(() => {
            state = {
                mainMenu: {
                    navigation: {
                        currentComponent: "abc"
                    }
                },
                secondaryMenu: {
                    navigation: {
                        currentComponent: "xyz"
                    }
                }
            };
        });

        it("should return the current component for mainMenu", () => {
            const side = "mainMenu",
                currentComponent = gettersMenu.currentComponent(state)(side);

            expect(currentComponent).to.equal("abc");
        });

        it("should return the current component for secondaryMenu", () => {
            const side = "secondaryMenu",
                currentComponent = gettersMenu.currentComponent(state)(side);

            expect(currentComponent).to.equal("xyz");
        });
    });

    describe("currentComponentName", () => {
        beforeEach(() => {
            state = {
                mainMenu: {
                    navigation: {
                        currentComponent: {
                            type: "root",
                            props: []
                        }
                    }
                },
                secondaryMenu: {
                    navigation: {
                        currentComponent: {
                            type: "xyz",
                            props: {
                                name: "common:xyz"
                            }
                        }
                    }
                }
            };
        });

        it("should return the current component name for mainMenu", () => {
            const side = "mainMenu",
                currentComponentName = gettersMenu.currentComponentName(state)(side);

            expect(currentComponentName).to.equal(i18next.t("common:modules.menu.name"));
        });

        it("should return the current component name for secondaryMenu", () => {
            const side = "secondaryMenu",
                currentComponentName = gettersMenu.currentComponentName(state)(side);

            expect(currentComponentName).to.equal(i18next.t("common:xyz"));
        });
    });

    describe("currentFolderPath", () => {
        beforeEach(() => {
            state = {
                mainMenu: {
                    navigation: {
                        currentComponent: {
                            props: {
                                path: [1, 2, 3]
                            }
                        }
                    }
                },
                secondaryMenu: {
                    navigation: {
                        currentComponent: {
                            props: {
                                path: ["x", "y", "z"]
                            }
                        }
                    }
                }
            };
        });

        it("should return the current folder path for mainMenu", () => {
            const side = "mainMenu",
                currentFolderPath = gettersMenu.currentFolderPath(state)(side);

            expect(currentFolderPath).to.deep.equal([1, 2, 3]);
        });

        it("should return the current folder path for secondaryMenu", () => {
            const side = "secondaryMenu",
                currentFolderPath = gettersMenu.currentFolderPath(state)(side);

            expect(currentFolderPath).to.deep.equal(["x", "y", "z"]);
        });
    });

    describe("deactivateModule", () => {
        beforeEach(() => {
            state = {
                activeModuleMouseMapInteractions: "getFeatureInfo"
            };
        });

        it("should return true, if module hasMouseMapInteractions === true and is not equal currentMouseMapInteractionsComponent", () => {
            const type = "measure";

            rootGetters = {
                "Modules/Measure/hasMouseMapInteractions": true
            };

            expect(gettersMenu.deactivateModule(state, undefined, undefined, rootGetters)(type)).to.be.true;
        });

        it("should return false, if module hasMouseMapInteractions === false and is not equal currentMouseMapInteractionsComponent", () => {
            const type = "measure";

            rootGetters = {
                "Modules/Measure/hasMouseMapInteractions": false
            };

            expect(gettersMenu.deactivateModule(state, undefined, undefined, rootGetters)(type)).to.be.false;
        });
    });

    describe("expanded", () => {
        beforeEach(() => {
            state = {
                mainMenu: {
                    expanded: true
                },
                secondaryMenu: {
                    expanded: false
                }
            };
        });

        it("should return the expanded for mainMenu", () => {
            const side = "mainMenu",
                expanded = gettersMenu.expanded(state)(side);

            expect(expanded).to.be.true;
        });

        it("should return the expandedfor secondaryMenu", () => {
            const side = "secondaryMenu",
                expanded = gettersMenu.expanded(state)(side);

            expect(expanded).to.be.false;
        });
    });

    describe("mainExpanded", () => {
        it("should return false if mainMenu is null", () => {
            state.mainMenu = {
                expanded: false
            };

            expect(gettersMenu.mainExpanded(state)).to.equal(false);
        });
        it("should return false if Expanded is not a boolean set on mainMenu", () => {
            expect(gettersMenu.mainExpanded(stateMenu)).to.equal(false);
        });
        it("should return the value of Expanded if mainMenu is not null (loaded) and is a boolean value on mainMenu", () => {
            state.mainMenu = {expanded: true};

            expect(gettersMenu.mainExpanded(state)).to.equal(true);
        });
    });

    describe("mainTitle", () => {
        it("should return null if mainMenu is null", () => {
            state.mainMenu = {
                title: null
            };

            expect(gettersMenu.mainTitle(state)).to.equal(null);
        });
        it("should return null if title is not defined on mainMenu", () => {
            expect(gettersMenu.mainTitle(stateMenu)).to.equal(null);
        });
        it("should return the title if it is defined on mainMenu", () => {
            const title = {
                "text": "Master",
                "logo": "https://geodienste.hamburg.de/lgv-config/img/hh-logo.png",
                "link": "https://geoinfo.hamburg.de",
                "toolTip": "Landesbetrieb Geoinformation und Vermessung"
            };

            state.mainMenu = {title};

            expect(gettersMenu.mainTitle(state)).to.deep.equal(title);
        });
    });

    describe("mainToggleButtonIcon", () => {
        it("should return the configured icon for the mainMenu if configured", () => {
            const toggleButtonIcon = "bi-bucket";

            state.mainMenu = {toggleButtonIcon};

            expect(gettersMenu.mainToggleButtonIcon(state)).to.equal(toggleButtonIcon);
        });
        it("should return the default icon if it isn't configured on mainMenu", () => {
            expect(gettersMenu.mainToggleButtonIcon(stateMenu)).to.equal("bi-list");
        });
    });

    describe("previousNavigationEntryText", () => {
        beforeEach(() => {
            state = {
                mainMenu: {
                    navigation: {
                        history: [
                            {
                                type: "root",
                                props: []
                            }
                        ]
                    }
                },
                secondaryMenu: {
                    navigation: {
                        history: [
                            {
                                type: "root",
                                props: []
                            },
                            {
                                type: "xyz",
                                props: {
                                    name: "common:xyz"
                                }
                            }
                        ]
                    }
                }
            };
        });

        it("should return the previous navigation entry text for mainMenu", () => {
            const side = "mainMenu",
                previousNavigationEntryText = gettersMenu.previousNavigationEntryText(state)(side);

            expect(previousNavigationEntryText).to.equal(i18next.t("common:modules.menu.name"));
        });

        it("should return the previous navigation entry text for secondaryMenu", () => {
            const side = "secondaryMenu",
                previousNavigationEntryText = gettersMenu.previousNavigationEntryText(state)(side);

            expect(previousNavigationEntryText).to.equal(i18next.t("common:xyz"));
        });
    });

    describe("secondaryExpanded", () => {
        it("should return false if secondaryMenu is null", () => {
            state.secondaryMenu = {
                expanded: false
            };

            expect(gettersMenu.secondaryExpanded(state)).to.equal(false);
        });
        it("should return false if Expanded is not a boolean set on secondaryMenu", () => {
            expect(gettersMenu.secondaryExpanded(stateMenu)).to.equal(false);
        });
        it("should return the value of Expanded if secondaryMenu is not null (loaded) and is a boolean value on secondaryMenu", () => {
            state.secondaryMenu = {expanded: true};

            expect(gettersMenu.secondaryExpanded(state)).to.equal(true);
        });
    });

    describe("secondaryTitle", () => {
        it("should return null if secondaryMenu is null", () => {
            state.secondaryMenu = {
                title: null
            };

            expect(gettersMenu.secondaryTitle(state)).to.equal(null);
        });
        it("should return null if title is not defined on secondaryMenu", () => {
            getters.secondaryMenu = {};

            expect(gettersMenu.secondaryTitle(stateMenu)).to.equal(null);
        });
        it("should return the title if it is defined on secondaryMenu", () => {
            const title = {
                "text": "Master",
                "logo": "https://geodienste.hamburg.de/lgv-config/img/hh-logo.png",
                "link": "https://geoinfo.hamburg.de",
                "toolTip": "Landesbetrieb Geoinformation und Vermessung"
            };

            state.secondaryMenu = {title};

            expect(gettersMenu.secondaryTitle(state)).to.deep.equal(title);
        });
    });

    describe("secondaryToggleButtonIcon", () => {
        it("should return the configured icon for the secondaryMenu if configured", () => {
            const toggleButtonIcon = "bi-bucket";

            state.secondaryMenu = {toggleButtonIcon};

            expect(gettersMenu.secondaryToggleButtonIcon(state)).to.equal(toggleButtonIcon);
        });
        it("should return the default icon if it isn't configured on secondaryMenu", () => {
            expect(gettersMenu.secondaryToggleButtonIcon(stateMenu)).to.equal("bi-tools");
        });
    });

    describe("section", () => {
        const goodPath = Symbol("woowee we found something");
        let foundSection, path;

        beforeEach(() => {
            foundSection = idx.badPathSymbol;
            path = [];
            sinon.stub(idx, "idx").callsFake(() => foundSection);
        });

        it("should return a found object from the getters through the given path if it exists for mainMenu", () => {
            foundSection = goodPath;
            path.push("mainMenu", "sections", 0);
            getters.mainMenu = {
                sections: [
                    goodPath
                ]
            };

            expect(gettersMenu.section(undefined, getters)(path)).to.equal(goodPath);
            expect(consoleErrorSpy.notCalled).to.be.true;
        });
        it("should return a found object from the getters through the given path if it exists for secondaryMenu", () => {
            foundSection = goodPath;
            path.push("secondaryMenu", "sections", 0);
            getters.secondaryMenu = {
                sections: [
                    goodPath
                ]
            };

            expect(gettersMenu.section(undefined, getters)(path)).to.equal(goodPath);
            expect(consoleErrorSpy.notCalled).to.be.true;
        });
        it("should return null and log an error if the first index of the path ('mainMenu' or 'secondaryMenu') is not null but the idx function return badPathSymbol", () => {
            path.push("mainMenu", "sections", 0);
            getters.mainMenu = {
                sections: [
                    goodPath
                ]
            };

            expect(gettersMenu.section(undefined, getters)(path)).to.equal(null);
            expect(consoleErrorSpy.calledOnce).to.be.true;
            expect(consoleErrorSpy.firstCall.args.length).to.equal(1);
            expect(consoleErrorSpy.firstCall.args[0]).to.equal(`Menu.getters.section: ${idx.badPathSymbol.description} ${path}.`);
        });
        it("should return null and log an error if the first index of the path ('mainMenu' or 'secondaryMenu') is null", () => {
            path.push("mainMenu", "sections", 0);

            expect(gettersMenu.section(undefined, getters)(path)).to.equal(null);
            expect(consoleErrorSpy.calledOnce).to.be.true;
            expect(consoleErrorSpy.firstCall.args.length).to.equal(1);
            expect(consoleErrorSpy.firstCall.args[0]).to.equal(`Menu: The given menu ${path[0]} is not configured in the config.json.`);
        });
    });

    describe("showDescription", () => {
        beforeEach(() => {
            state = {
                mainMenu: {
                    showDescription: false
                },
                secondaryMenu: {
                    showDescription: true
                }
            };
        });

        it("should return the showDescription for mainMenu", () => {
            const side = "mainMenu",
                showDescription = gettersMenu.showDescription(state)(side);

            expect(showDescription).to.be.false;
        });

        it("should return the showDescription for secondaryMenu", () => {
            const side = "secondaryMenu",
                showDescription = gettersMenu.showDescription(state)(side);

            expect(showDescription).to.be.true;
        });
    });

    describe("titleBySide", () => {
        const exampleTitle = {
            text: "Precise name",
            logo: "some png source",
            link: "https://valid.url.com",
            toolTip: "More info"
        };

        it("should return the mainTitle properties as well as the side as idAppendix if the side is 'mainMenu' and 'mainTitle' is defined", () => {
            getters.mainTitle = exampleTitle;

            const side = "mainMenu",
                nameObject = gettersMenu.titleBySide(undefined, getters)(side);

            expect(nameObject).to.not.equal(null);
            expect(nameObject.text).to.equal(exampleTitle.text);
            expect(nameObject.logo).to.equal(exampleTitle.logo);
            expect(nameObject.link).to.equal(exampleTitle.link);
            expect(nameObject.toolTip).to.equal(exampleTitle.toolTip);
            expect(nameObject.idAppendix).to.equal(side);
        });
        it("should return the mainTitle properties as well as the side as idAppendix if the side is 'secondaryMenu' and 'secondaryTitle' is defined", () => {
            getters.secondaryTitle = exampleTitle;

            const side = "secondaryMenu",
                nameObject = gettersMenu.titleBySide(undefined, getters)(side);

            expect(nameObject).to.not.equal(null);
            expect(nameObject.text).to.equal(exampleTitle.text);
            expect(nameObject.logo).to.equal(exampleTitle.logo);
            expect(nameObject.link).to.equal(exampleTitle.link);
            expect(nameObject.toolTip).to.equal(exampleTitle.toolTip);
            expect(nameObject.idAppendix).to.equal(side);
        });
        it("should return null if a given side does not have a name defined", () => {
            expect(gettersMenu.titleBySide(undefined, getters)("mainMenu")).to.equal(null);
        });
        it("should return null if a given side does not equal 'mainMenu' or 'secondaryMenu'", () => {
            expect(gettersMenu.titleBySide(undefined, getters)("newMenu")).to.equal(null);
        });
    });

    describe("urlParams", () => {
        beforeEach(() => {
            state = {
                mainMenu: {
                    currentComponent: "root"
                },
                secondaryMenu: {
                    currentComponent: "abc"
                }
            };

            getters = {
                getComponentAttributes: (component) => {
                    return component === "root" ? undefined : {a: "1", b: "2"};
                }
            };
        });

        it("should return the menu params with attributes", () => {
            const params = gettersMenu.urlParams(state, getters);

            expect(params).to.deep.equals({
                main: {
                    currentComponent: "root"
                },
                secondary: {
                    currentComponent: "abc",
                    attributes: {
                        a: "1",
                        b: "2"
                    }
                }
            });
        });
    });

    describe("getComponentAttributes", () => {
        beforeEach(() => {
            rootState = {};
            rootGetters = {
                "Modules/CompA/urlParams": {
                    a: 1,
                    b: 2
                }
            };
        });

        it("should return the menu attributes to a component", () => {
            const currentComponent = "compA",
                moduleAttributes = gettersMenu.getComponentAttributes(undefined, undefined, rootState, rootGetters)(currentComponent);

            expect(moduleAttributes).to.deep.equals({
                a: 1,
                b: 2
            });
        });
    });
});
