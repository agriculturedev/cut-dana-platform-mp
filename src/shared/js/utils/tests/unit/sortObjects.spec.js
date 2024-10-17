import {expect} from "chai";
import {sortObjects, getNestedElement} from "../../sortObjects.js";

describe("src/shared/js/utils/sortObjects.js", () => {
    const objects = [
        {
            name: "1a",
            properties: {
                housenumber: {
                    _: 1
                },
                hausnumberextension: {
                    _: "a"
                }
            }
        },
        {
            name: "1",
            properties: {
                housenumber: {
                    _: 1
                }
            }
        },
        {
            name: "1b",
            properties: {
                housenumber: {
                    _: 1
                },
                hausnumberextension: {
                    _: "b"
                }
            }
        },
        {
            name: "2",
            properties: {
                housenumber: {
                    _: 2
                }
            }
        }
    ];

    describe("sortObjects", () => {
        it("should return an sorted array with objects sorted by house number extensions - ascending", () => {
            const cloneObjects = [...objects],
                nestedAttribute = "properties.hausnumberextension._";

            sortObjects(cloneObjects, nestedAttribute);
            expect(cloneObjects).to.be.an("array");
            expect(cloneObjects, nestedAttribute).to.have.deep.members([
                {
                    name: "1",
                    properties: {
                        housenumber: {
                            _: 1
                        }
                    }
                },
                {
                    name: "2",
                    properties: {
                        housenumber: {
                            _: 2
                        }
                    }
                },
                {
                    name: "1a",
                    properties: {
                        housenumber: {
                            _: 1
                        },
                        hausnumberextension: {
                            _: "a"
                        }
                    }
                },
                {
                    name: "1b",
                    properties: {
                        housenumber: {
                            _: 1
                        },
                        hausnumberextension: {
                            _: "b"
                        }
                    }
                }
            ]);
        });

        it("should return an sorted array with objects sorted by house number extensions - descending", () => {
            const cloneObjects = [...objects],
                nestedAttribute = "properties.hausnumberextension._";

            sortObjects(cloneObjects, nestedAttribute, "desc");
            expect(cloneObjects).to.be.an("array");
            expect(cloneObjects, nestedAttribute).to.have.deep.members([
                {
                    name: "1b",
                    properties: {
                        housenumber: {
                            _: 1
                        },
                        hausnumberextension: {
                            _: "b"
                        }
                    }
                },
                {
                    name: "1a",
                    properties: {
                        housenumber: {
                            _: 1
                        },
                        hausnumberextension: {
                            _: "a"
                        }
                    }
                },
                {
                    name: "2",
                    properties: {
                        housenumber: {
                            _: 2
                        }
                    }
                },
                {
                    name: "1",
                    properties: {
                        housenumber: {
                            _: 1
                        }
                    }
                }
            ]);
        });
    });
    describe("getNestedElement", () => {
        it("should return the nested element for the nested attribute", () => {
            const searchElement = {
                    name: "1b",
                    properties: {
                        housenumber: {
                            _: 1
                        },
                        hausnumberextension: {
                            _: "b"
                        }
                    }
                },
                nestedAttribute = "properties.hausnumberextension._";

            expect(getNestedElement(searchElement, nestedAttribute)).to.be.a("string");
            expect(getNestedElement(searchElement, nestedAttribute)).equals("b");
        });
        it("should return an empty string for the nested attribute, if the search element does not have this attribute ", () => {
            const searchElement = {
                    name: "1b",
                    properties: {
                        housenumber: {
                            _: 1
                        }
                    }
                },
                nestedAttribute = "properties.hausnumberextension._";

            expect(getNestedElement(searchElement, nestedAttribute)).to.be.a("string");
            expect(getNestedElement(searchElement, nestedAttribute)).equals("");
        });
    });
});
