
export const API  = {
    request : async (method='POST', url, data={}, headers={}) =>
    {
        try
        {
            const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');

            headers = {...headers, ...{
                    'Accept': 'application/json'
                }
            }

            const params = {
                //redirect    : 'follow',
                method      : method,
                headers     : headers,
                mode        : "cors"
            };

            if(method === 'POST')
                Object.assign(params,{body : toUrlEncoded(data)});

            let response = await fetch(
                url,
                params
            );
            return await response.json();
        } catch (error) {
            console.warn(error);
            return [];
        }
    }
};