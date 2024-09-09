import utilsAxios from "../../../utils/utilsAxios.js";
import {expect} from "chai";
import axios from "axios";

describe("src/modules/tools/login/utils/utilsAxios.js", async () => {
    it("should set Bearer token for url as string.", () => {
        const token = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJncDV4UkhSVjR2SXR0R1RRVmttLW9ucGtXb2JFQzhrS09iemRUNTlaaGhNIn0.eyJleHAiOjE3MjU4ODAxOTMsImlhdCI6MTcyNTg3OTg5MywiYXV0aF90aW1lIjoxNzI1ODc2MDIwLCJqdGkiOiIwNmVlOGZmMS04MmJmLTQ3MDEtYjA4OS1jYjFiMDBhNGI1YWMiLCJpc3MiOiJodHRwczovL3VkcC1wcm9kdWt0aXNpZXJ1bmctNDg1MjcuZHNlY3VyZWNsb3VkLmRlL2tleWNsb2FrL3JlYWxtcy9VRFBfUHJvZHVrdGlzaWVydW5nIiwiYXVkIjpbIm1wX2xvY2FsaG9zdCIsImFjY291bnQiXSwic3ViIjoiYzJkZDFiZWQtNDU0NS00MWZiLTg2OTUtNWNkYjliMDYzOTYwIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoibWFzdGVycG9ydGFsIiwic2lkIjoiZWNhNjdiZjgtYmYyMy00OWQ2LTlhOWItMDgzNGIyZmFmOWIzIiwiYWNyIjoiMCIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwczovL3VkcC1wcm9kdWt0aXNpZXJ1bmctNDg1MjcuZHNlY3VyZWNsb3VkLmRlL3BvcnRhbC8iXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbImRlZmF1bHQtcm9sZXMtdWRwX3Byb2R1a3Rpc2llcnVuZyIsIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJtcF9sb2NhbGhvc3QiOnsicm9sZXMiOlsia2llbCJdfSwibWFzdGVycG9ydGFsIjp7InJvbGVzIjpbImtpZWwiLCJ4YW50ZW4iXX0sImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoib3BlbmlkIGVtYWlsIHByb2ZpbGUiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsIm5hbWUiOiJhIGIiLCJjbGllbnQiOlsia2llbCJdLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJzdmVuIiwiZ2l2ZW5fbmFtZSI6ImEiLCJmYW1pbHlfbmFtZSI6ImIiLCJlbWFpbCI6ImFhQGIuZGUifQ.eIq-D47jlGcdMMXFR_mrvK57TDK_ClX8H3J9-4HwELGW9i_pvHCZg8xuSRzjjR84Y1Qw0yf1zr_qetf0pQdLrxatUjZH7Xaztm01Q3SgIHBLMOo6_n-QqrflkWP6FG4jG2u2gkdlSRZmX1i_z9S7Ujp0UVCiyM_-j_9dr4MMDTEjxQTWGganSu9Gkhaz-RVrcr2Hn50ZIYdzVFgeYr_Tkba7WMfPBCZW46XhkmxCjMyyz9dzED4q4qk8OQBa9YlIJYGN4Hnlc9cZPaCLC51wi_m-WHfhMHBo5kmY9zXJaDxsffI3XMZESL6Y4f_ZFM7bYSIiE9PYHmcRRrutTVFQIA",
            interceptorUrlRegex = "https?://test-url.de*",
            config = {
                headers: {},
                url: "https://test-url.de/wms_example"
            };

        utilsAxios.addInterceptor(token, interceptorUrlRegex);

        expect(axios.interceptors.request.handlers[0].fulfilled(config).headers).to.deep.equals({
            Authorization: "Bearer " + token
        });
        expect(axios.interceptors.request.handlers[0].fulfilled(config).url).to.equals(config.url);
    });

    it("should set Bearer token for url as object.", () => {
        const token = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJncDV4UkhSVjR2SXR0R1RRVmttLW9ucGtXb2JFQzhrS09iemRUNTlaaGhNIn0.eyJleHAiOjE3MjU4ODAxOTMsImlhdCI6MTcyNTg3OTg5MywiYXV0aF90aW1lIjoxNzI1ODc2MDIwLCJqdGkiOiIwNmVlOGZmMS04MmJmLTQ3MDEtYjA4OS1jYjFiMDBhNGI1YWMiLCJpc3MiOiJodHRwczovL3VkcC1wcm9kdWt0aXNpZXJ1bmctNDg1MjcuZHNlY3VyZWNsb3VkLmRlL2tleWNsb2FrL3JlYWxtcy9VRFBfUHJvZHVrdGlzaWVydW5nIiwiYXVkIjpbIm1wX2xvY2FsaG9zdCIsImFjY291bnQiXSwic3ViIjoiYzJkZDFiZWQtNDU0NS00MWZiLTg2OTUtNWNkYjliMDYzOTYwIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoibWFzdGVycG9ydGFsIiwic2lkIjoiZWNhNjdiZjgtYmYyMy00OWQ2LTlhOWItMDgzNGIyZmFmOWIzIiwiYWNyIjoiMCIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwczovL3VkcC1wcm9kdWt0aXNpZXJ1bmctNDg1MjcuZHNlY3VyZWNsb3VkLmRlL3BvcnRhbC8iXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbImRlZmF1bHQtcm9sZXMtdWRwX3Byb2R1a3Rpc2llcnVuZyIsIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJtcF9sb2NhbGhvc3QiOnsicm9sZXMiOlsia2llbCJdfSwibWFzdGVycG9ydGFsIjp7InJvbGVzIjpbImtpZWwiLCJ4YW50ZW4iXX0sImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoib3BlbmlkIGVtYWlsIHByb2ZpbGUiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsIm5hbWUiOiJhIGIiLCJjbGllbnQiOlsia2llbCJdLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJzdmVuIiwiZ2l2ZW5fbmFtZSI6ImEiLCJmYW1pbHlfbmFtZSI6ImIiLCJlbWFpbCI6ImFhQGIuZGUifQ.eIq-D47jlGcdMMXFR_mrvK57TDK_ClX8H3J9-4HwELGW9i_pvHCZg8xuSRzjjR84Y1Qw0yf1zr_qetf0pQdLrxatUjZH7Xaztm01Q3SgIHBLMOo6_n-QqrflkWP6FG4jG2u2gkdlSRZmX1i_z9S7Ujp0UVCiyM_-j_9dr4MMDTEjxQTWGganSu9Gkhaz-RVrcr2Hn50ZIYdzVFgeYr_Tkba7WMfPBCZW46XhkmxCjMyyz9dzED4q4qk8OQBa9YlIJYGN4Hnlc9cZPaCLC51wi_m-WHfhMHBo5kmY9zXJaDxsffI3XMZESL6Y4f_ZFM7bYSIiE9PYHmcRRrutTVFQIA",
            interceptorUrlRegex = "https?://test-url.de*",
            config = {
                headers: {},
                url: {
                    host: "test-url.de",
                    href: "https://test-url.de/wms_example",
                    origin: "https://test-url.de",
                    protocol: "https:"
                },
            };

        utilsAxios.addInterceptor(token, interceptorUrlRegex);

        expect(axios.interceptors.request.handlers[0].fulfilled(config).headers).to.deep.equals({
            Authorization: "Bearer " + token
        });
        expect(axios.interceptors.request.handlers[0].fulfilled(config).url).to.deep.equals(config.url);
    });
});
