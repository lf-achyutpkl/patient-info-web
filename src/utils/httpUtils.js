import axios from 'axios';

export function get(url){
  return axios(url).then(response => response.data);
}

export function put(url, body){
  return axios.put(url, body).then(response => response.data);
}
