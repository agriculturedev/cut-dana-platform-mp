import getNestedValues from "../../getNestedValues.js";
import {expect} from "chai";
import {treeSubjectsKey} from "../../constants.js";

describe("src/shared/js/utils/getNestedValues.js", () => {
    const starks = {
        Ned: {
            fullName: "Eddard Stark",
            details: {
                age: 47,
                stillAlive: false
            },
            children: ["Robb", "Sans", "Arya"]
        },
        Catelyn: {
            fullName: "Catelyn Tully",
            details: {
                age: 49,
                stillAlive: false
            },
            children: ["Robb", "Sans", "Arya"]
        },
        Rickard: {
            fullName: "Rickard Stark",
            details: {
                stillAlive: false
            },
            children: ["Ned", "Brandon", "Lyanna", "Benjen"]
        },
        Arya: {
            fullName: "Arya Stark",
            details: {
                age: 17,
                stillAlive: true
            }
        }
    };

    it("should return an empty array if only one param is given", () => {
        expect(getNestedValues({})).to.be.empty;
    });

    it("should return an empty array if the first param is not an object", () => {
        expect(getNestedValues(undefined, "age")).to.be.empty;
        expect(getNestedValues(null, "age")).to.be.empty;
        expect(getNestedValues(false, "age")).to.be.empty;
        expect(getNestedValues(true, "age")).to.be.empty;
        expect(getNestedValues("Hello", "age")).to.be.empty;
        expect(getNestedValues(42, "age")).to.be.empty;
    });

    it("should return an empty array if the given key is not existing", () => {
        expect(getNestedValues(starks, undefined)).to.be.empty;
        expect(getNestedValues(starks, null)).to.be.empty;
        expect(getNestedValues(starks, [])).to.be.empty;
        expect(getNestedValues(starks, {})).to.be.empty;
        expect(getNestedValues(starks, false)).to.be.empty;
        expect(getNestedValues(starks, true)).to.be.empty;
        expect(getNestedValues(starks, 5)).to.be.empty;
        expect(getNestedValues(starks, "status")).to.be.empty;
        expect(getNestedValues(starks, "")).to.be.empty;
    });

    it("should return an array with valid values", () => {
        expect(getNestedValues(starks, "Arya")).to.deep.equal([{
            fullName: "Arya Stark",
            details: {
                age: 17,
                stillAlive: true
            }
        }]);
        expect(getNestedValues(starks, "age")).to.deep.equal([47, 49, 17]);
        expect(getNestedValues(starks, "children")).to.deep.equal([["Robb", "Sans", "Arya"], ["Robb", "Sans", "Arya"], ["Ned", "Brandon", "Lyanna", "Benjen"]]);
        expect(getNestedValues(starks, "stillAlive")).to.deep.equal([false, false, false, true]);
        expect(getNestedValues(starks, "details")).to.deep.equal([
            {
                "age": 47,
                "stillAlive": false
            },
            {
                "age": 49,
                "stillAlive": false
            },
            {
                "stillAlive": false
            },
            {
                "age": 17,
                "stillAlive": true
            }
        ]);
    });

    it("should respect searchKeyForArrays", () => {
        const json = {
                [treeSubjectsKey]: {
                    "elements": [
                        {
                            "id": "1",
                            "type": "layer"
                        },
                        {
                            "id": "2"
                        },
                        {
                            "name": "Ordner 1",
                            "type": "folder",
                            "elements": [
                                {
                                    "id": "3"
                                },
                                {
                                    "name": "Ordner 2",
                                    "type": "folder",
                                    "elements": [
                                        {
                                            "id": "4"
                                        },
                                        {
                                            "id": "5"
                                        }
                                    ]
                                },
                                {
                                    "name": "Gruppenlayer",
                                    "type": "group",
                                    "elements": [
                                        {
                                            "id": "6"
                                        },
                                        {
                                            "id": "7"
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            },
            result = getNestedValues(json, "elements", true).flat(Infinity);

        expect(result.length).to.equal(7);
        expect(result[0].id).to.equal("1");
        expect(result[1].id).to.equal("2");
        expect(result[2].id).to.equal("3");
        expect(result[3].id).to.equal("4");
        expect(result[4].id).to.equal("5");
        expect(result[5].id).to.equal("6");
        expect(result[6].id).to.equal("7");
    });
});

