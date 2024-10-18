import sinon from "sinon";
import {expect} from "chai";
import * as calculateSquare from "../../../utils/squareCalculations";

const mockGeometry = {
        getCoordinates: sinon.stub().returns([]),
        setCoordinates: sinon.stub()
    },

    mockFeature = {
        getGeometry: sinon.stub().returns(mockGeometry)
    },

    mockSquareCenter = [0, 0],
    mockSquareArea = 16;

describe("calculateSquare", () => {
    it("should create a square around the center with the specified area", () => {
        calculateSquare.calculateSquare(mockFeature, mockSquareCenter, mockSquareArea);

        const halfSide = Math.sqrt(mockSquareArea) / 2,
            expectedCoordinates = [
                [
                    [mockSquareCenter[0] - halfSide, mockSquareCenter[1] + halfSide],
                    [mockSquareCenter[0] + halfSide, mockSquareCenter[1] + halfSide],
                    [mockSquareCenter[0] + halfSide, mockSquareCenter[1] - halfSide],
                    [mockSquareCenter[0] - halfSide, mockSquareCenter[1] - halfSide],
                    [mockSquareCenter[0] - halfSide, mockSquareCenter[1] + halfSide]
                ]
            ],

            resultCoordinates = mockGeometry.setCoordinates.getCall(0).args[0];

        expect(resultCoordinates).to.deep.equal(expectedCoordinates);
    });
});
