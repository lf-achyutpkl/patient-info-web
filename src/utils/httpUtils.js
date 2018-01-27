import axios from 'axios';

export function get(url){
  return axios(url).then(response => response.data);
}
