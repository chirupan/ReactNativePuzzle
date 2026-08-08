/* eslint-disable import/prefer-default-export */

import { Image, ImageURISource } from 'react-native';
import { invoke } from './controlFlow';

/**
 * Make a `HEAD` request to determine the final URL, following redirects.
 *
 * The inbuild fetch() is capable enough of handling redirects
 * @param {string} url The initial URL
 * @returns {Promise} A promise resolving to the final URL
 */
async function getRedirectURL(url: string) : Promise<string> {
  let redirectUrl: string = "";
  try {
    // the inbuilt fetch() is already capable of handling
    // redirects and other cors issues and provides the redirect url
    const response = await fetch(url);
    redirectUrl = response.url;
  } catch (error) {
    console.log(`Error fetching the redirect URL: ${error}`);
  }
  return redirectUrl;
}

/**
 * Fetch a random image
 *
 * @returns {Promise} A promise resolving to a random image
 */
export async function getRandomImage(): Promise<ImageURISource> {
  let uri: string = "";
  try {
    uri = await invoke({ retry: 3, timeout: 5000 }, () =>
      getRedirectURL("https://picsum.photos/600/600/?random"),
    );
  } catch(error) {
    console.log(`Error fetching image : ${error}`);
  }
  // check for any errors while fetching the redirectURL
  // or other issues
  if (!uri){
    // fetch a sample image from local dir
    const img = require('../../assets/images/tutorial-web.png');
    const imgSource = Image.resolveAssetSource(img);
    uri = imgSource.uri;
  }
  return { uri, width: 300, height: 300 };
}
