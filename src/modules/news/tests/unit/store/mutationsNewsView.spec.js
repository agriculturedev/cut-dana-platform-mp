import {expect} from "chai";
import mutations from "../../../store/mutationsNewsView";

const {addNews} = mutations;

describe("src/modules/newsView/store/mutationsNewsView.js", () => {
    describe("addNews", () => {
        it("adds a news to the state list if news", () => {
            const localState = {
                    news: []
                },
                news1 = {
                    category: "category 1",
                    content: "content 1",
                    displayFrom: "2022-02-18 13:00",
                    displayUntil: "2022-02-25 18:00"
                },
                news2 = {
                    category: "category 2",
                    content: "content 2",
                    displayFrom: "2020-02-18 13:00",
                    displayUntil: "2020-02-25 18:00"
                };

            addNews(localState, news1);
            expect(localState.news).to.be.deep.equals([news1]);
            addNews(localState, news2);
            expect(localState.news).to.be.deep.equals([news1, news2]);

        });

    });
});
