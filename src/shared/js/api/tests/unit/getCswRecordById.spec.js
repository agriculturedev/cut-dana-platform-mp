import {expect} from "chai";
import getCswRecordById from "../../getCswRecordById.js";

const jsonWithMD_DataIdentification = {
        GetRecordByIdResponse: {
            MD_Metadata: {
                identificationInfo: {
                    MD_DataIdentification: {
                        citation: {
                            CI_Citation: {
                                title: {
                                    CharacterString: {
                                        getValue: () => "Batman"
                                    }
                                },
                                date: [
                                    {
                                        CI_Date: {
                                            date: {
                                                Date: {
                                                    getValue: () => "18.03.2021"
                                                }
                                            }
                                        }
                                    },
                                    {
                                        CI_Date: {
                                            date: {
                                                Date: {
                                                    getValue: () => "19.04.2022"
                                                }
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            }
        }
    },
    jsonWithSV_ServiceIdentification = {
        GetRecordByIdResponse: {
            MD_Metadata: {
                identificationInfo: {
                    SV_ServiceIdentification: {
                        citation: {
                            CI_Citation: {
                                title: {
                                    CharacterString: {
                                        getValue: () => "Robin"
                                    }
                                },
                                date: [
                                    {
                                        CI_Date: {
                                            date: {
                                                Date: {
                                                    getValue: () => "01.01.1999"
                                                }
                                            }
                                        }
                                    },
                                    {
                                        CI_Date: {
                                            date: {
                                                Date: {
                                                    getValue: () => "02.02.2000"
                                                }
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            }
        }
    },
    jsonWithResourceConstraints = {
        GetRecordByIdResponse: {
            MD_Metadata: {
                identificationInfo: {
                    MD_DataIdentification: {
                        resourceConstraints: [
                            {
                                MD_LegalConstraints: {
                                    accessConstraints: {
                                        MD_RestrictionCode: {
                                            getAttributes: () => {
                                                return {"codeListValue": "otherRestrictions"};
                                            }
                                        }
                                    },
                                    otherConstraints: {
                                        Anchor: {
                                            getValue: () => "Es gelten keine Zugriffsbeschränkungen"
                                        }
                                    }
                                }
                            },
                            {
                                MD_LegalConstraints: {
                                    useConstraints: {
                                        MD_RestrictionCode: {
                                            getAttributes: () => {
                                                return {"codeListValue": "otherRestrictions"};
                                            }
                                        }
                                    },
                                    otherConstraints: [
                                        {
                                            CharacterString: {
                                                getValue: () => "Die Daten sind urheberrechtlich geschützt. Die Daten werden geldleistungsfrei gemäß der Datenlizenz Deutschland Namensnennung 2.0 (https://www.govdata.de/dl-de/by-2-0) zur Verfügung gestellt. Die Verwendung des Datensatzes für die Pflege und Erweiterung der Daten des OpenStreetMap Projektes wird unter Einhaltung der im Ergänzungstext beschriebenen Angaben zur Namensnennung ausdrücklich erlaubt, siehe https://sgx.geodatenzentrum.de/web_public/gdz/lizenz/deu/Datenlizenz_Deutschland_Ergänzungstext_Namensnennung.pdf. Der Quellenvermerk ist zu beachten."
                                            }
                                        },
                                        {
                                            CharacterString: {
                                                getValue: () => "Quellenvermerk: Kartendarstellung: © Bundesamt für Kartographie und Geodäsie (2023), Datenquellen: https://sg.geodatenzentrum.de/web_public/Datenquellen_TopPlus_Open.html"
                                            }
                                        },
                                        {
                                            CharacterString: {
                                                getValue: () => "{\"id\":\"dl-by-de/2.0\",\"name\":\"Datenlizenz Deutschland Namensnennung 2.0\",\"url\":\"https://www.govdata.de/dl-de/by-2-0\",\"quelle\":\"Kartendarstellung: © Bundesamt für Kartographie und Geodäsie (2023), Datenquellen: https://sg.geodatenzentrum.de/web_public/Datenquellen_TopPlus_Open.html\"}"
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                }
            }
        }
    };


describe("src/js/api/getCswRecordById.js", () => {
    describe("getMdIdentification", () => {
        it("should return the node MD_DataIdentification if exist", () => {
            expect(getCswRecordById.getMdIdentification(jsonWithMD_DataIdentification)).to.deep.equal(
                jsonWithMD_DataIdentification.GetRecordByIdResponse.MD_Metadata.identificationInfo.MD_DataIdentification
            );
        });
        it("should return the node SV_ServiceIdentification if exist", () => {
            expect(getCswRecordById.getMdIdentification(jsonWithSV_ServiceIdentification)).to.deep.equal(
                jsonWithSV_ServiceIdentification.GetRecordByIdResponse.MD_Metadata.identificationInfo.SV_ServiceIdentification
            );
        });
    });

    describe("parseTitle", () => {
        it("should return the title with the MD_Identification node as MD_DataIdentification", () => {
            expect(getCswRecordById.parseTitle(jsonWithMD_DataIdentification)).to.equals("Batman");
        });
        it("should return the title with the MD_Identification node as SV_ServiceIdentification", () => {
            expect(getCswRecordById.parseTitle(jsonWithSV_ServiceIdentification)).to.equals("Robin");
        });
    });

    describe("parseConstraints", () => {
        it("should return an object with access and use", () => {
            expect(getCswRecordById.parseConstraints({})).to.be.an("object").that.include({access: undefined}).and.have.property("use").that.is.an("array").that.is.empty;
        });
        it("should contain parsed data for property access", () => {
            expect(getCswRecordById.parseConstraints(jsonWithResourceConstraints)).to.be.an("object").that.have.property("access").to.equal("Es gelten keine Zugriffsbeschränkungen");
        });
        it("should contain parsed data for property use", () => {
            expect(getCswRecordById.parseConstraints(jsonWithResourceConstraints)).to.be.an("object").that.have.property("use").that.is.an("array").to.have.lengthOf(3);
        });
    });
});
