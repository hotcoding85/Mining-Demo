import axios from "axios";
import { decryptData } from "utils/cryptoUtils";
// default
axios.defaults.baseURL = process.env.REACT_APP_API_URL + "/v1";

// content type
axios.defaults.headers.post["Content-Type"] = "application/json";
// content type

// Request interceptor for adding Authorization header
axios.interceptors.request.use(
  async (config) => {
    const eToken = localStorage.getItem("token");

    if (eToken) {
      const token = decryptData(eToken);
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  async (response) => {
    const contentType = response.headers.get("content-type");
    if (
      contentType &&
      contentType.indexOf("application/json") !== -1 &&
      response.request.responseType === "blob"
    ) {
      response.data = await response.data.text();
      response.data = JSON.parse(response.data);
    }
    return response.data ? response.data : response;
  },
  async (error) => {
    const { config, response } = error;
    if (response && response.status === 401) {
    }

    return Promise.reject(error.response);
  }
);

// // intercepting to capture errors
// axios.interceptors.response.use(
//   function (response: any) {
//     return response.data ? response.data : response;
//   },
//   function (error: any) {
//     // Any status codes that falls outside the range of 2xx cause this function to trigger
//     let message: any;
//     switch (error.status) {
//       case 500:
//         message = "Internal Server Error";
//         break;
//       case 401:
//         message = "Invalid credentials";
//         break;
//       case 404:
//         message = "Sorry! the data you are looking for could not be found";
//         break;
//       default:
//         message = error.message || error;
//     }
//     return Promise.reject(message);
//   }
// );

class APIClient {
  /**
   * Fetches data from given url
   */

  //  get = (url, params) => {
  //   return axios.get(url, params);
  // };
  get = (url: any, params: any) => {
    let response: any;

    let paramKeys: any = [];

    if (params) {
      Object.keys(params).map((key) => {
        paramKeys.push(key + "=" + params[key]);
        return paramKeys;
      });

      const queryString =
        paramKeys && paramKeys.length ? paramKeys.join("&") : "";
      response = axios.get(`${url}?${queryString}`, params);
    } else {
      response = axios.get(`${url}`, params);
    }

    return response;
  };
  /**
   * post given data to url
   */
  create = (
    url: any,
    data: any,
    p0?: { headers: { "Content-Type": string } }
  ) => {
    return axios.post(url, data, p0);
  };
  /**
   * Updates data
   */
  update = (url: any, data: any) => {
    return axios.patch(url, data);
  };

  put = (url: any, data: any) => {
    return axios.put(url, data);
  };
  /**
   * Delete
   */
  delete = (url: any, config: any) => {
    return axios.delete(url, { ...config });
  };
}

export { APIClient };
