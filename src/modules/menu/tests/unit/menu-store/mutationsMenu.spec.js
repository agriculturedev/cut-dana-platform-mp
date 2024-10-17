import {expect} from "chai";
import mutations from "../../../menu-store/mutationsMenu.js";


describe("src/core/menu/menu-store/mutationsMenu.js", () => {
    let state;

    describe("collapseMenues", () => {
        beforeEach(() => {
            state = {
                mainMenu: {
                    expanded: true
                },
                secondaryMenu: {
                    expanded: true
                }
            };
        });

        it("The two menus should have expanded false", () => {
            mutations.collapseMenues(state);

            expect(state.mainMenu.expanded).to.be.false;
            expect(state.secondaryMenu.expanded).to.be.false;
        });
    });

    describe("mergeMenuState", () => {
        beforeEach(() => {
            state = {
                mainMenu: {
                    abc: "abc"
                },
                secondaryMenu: {
                    xyz: "xyz"
                }
            };
        });

        it("Should merge the main menu state", () => {
            const side = "mainMenu",
                menu = {
                    hans: "hans"
                };

            mutations.mergeMenuState(state, {menu, side});

            expect(state.mainMenu).to.deep.equals({
                abc: "abc",
                hans: "hans"
            });
        });

        it("Should merge the secondary menu state", () => {
            const side = "secondaryMenu",
                menu = {
                    fritz: "fritz"
                };

            mutations.mergeMenuState(state, {menu, side});

            expect(state.secondaryMenu).to.deep.equals({
                xyz: "xyz",
                fritz: "fritz"
            });
        });
    });

    describe("setCurrentComponent", () => {
        beforeEach(() => {
            state = {
                mainMenu: {
                    navigation: {
                        currentComponent: {
                            type: "abc",
                            props: {
                                name: "common:abc"
                            }
                        },
                        history: []
                    }
                }
            };
        });

        it("Should save the last component in navigation history an set current component", () => {
            const side = "mainMenu",
                type = "xyz",
                props = {
                    name: "common:xyz"
                };

            mutations.setCurrentComponent(state, {type, side, props});

            expect(state.mainMenu.navigation.history).to.deep.includes({
                type: "abc",
                props: {
                    name: "common:abc"
                }
            });
            expect(state.mainMenu.navigation.currentComponent).to.deep.equals({
                type: "xyz",
                props: {
                    name: "common:xyz"
                }
            });
            expect(state.mainMenu.currentComponent).to.equals("xyz");
        });
    });

    describe("setExpandedBySide", () => {
        beforeEach(() => {
            state = {
                mainMenu: {
                    expanded: true
                },
                secondaryMenu: {
                    expanded: true
                }
            };
        });

        it("The main menu should have expanded false", () => {
            const expanded = false,
                side = "mainMenu";

            mutations.setExpandedBySide(state, {expanded, side});

            expect(state.mainMenu.expanded).to.be.false;
            expect(state.secondaryMenu.expanded).to.be.true;
        });
    });

    describe("switchToPreviousComponent", () => {
        beforeEach(() => {
            state = {
                mainMenu: {
                    navigation: {
                        currentComponent: {
                            type: "abc",
                            props: {
                                name: "common:abc"
                            }
                        },
                        history: [
                            {
                                type: "root",
                                props: {
                                    name: "common:root"
                                }
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

        it("Should switch to previous component and pop this entry from history", () => {
            const side = "mainMenu";

            mutations.switchToPreviousComponent(state, side);

            expect(state.mainMenu.navigation.currentComponent).to.deep.equals({
                type: "xyz",
                props: {
                    name: "common:xyz"
                }
            });
            expect(state.mainMenu.currentComponent).to.equals("xyz");
            expect(state.mainMenu.navigation.history).to.deep.includes({
                type: "root",
                props: {
                    name: "common:root"
                }
            });
        });
    });

    describe("switchToRoot", () => {
        beforeEach(() => {
            state = {
                mainMenu: {
                    navigation: {
                        currentComponent: {
                            type: "abc",
                            props: {
                                name: "common:abc"
                            }
                        },
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

        it("Should switch to root component and pop all entries from history", () => {
            const side = "mainMenu";

            mutations.switchToRoot(state, side);

            expect(state.mainMenu.navigation.currentComponent).to.deep.equals({
                type: "root",
                props: []
            });
            expect(state.mainMenu.navigation.history).to.be.an("array").that.is.empty;
            expect(state.mainMenu.currentComponent).to.equals("root");
        });
    });
});
