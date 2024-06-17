
import SeverConfig from "../SeverConfig";

export default class HTTPNet {
    static post(url, params, cb, useBaseUrl = true, header = false,failCb=null){
		// if (!cc.sys.isNative) {
		// 	this.webPost(url, params, cb);
		// }else{
		// 	this.nativePost(url, params, cb);
		// }
		this.nativePost(url, params, cb, useBaseUrl, header,failCb);
	}
	static webPost(url, params, cb){
		// window.$.post(Config.getServerConf().web+url, params, res=>{
        //     cb(res);
		// 	cc.log(res)
        // //    this.toastErrorMsg(res);
        // });
	}

	static get(url, cb,failCb=null){
		// this.ajax({
		// 	url: url, 
		// 	type: "GET",
		// 	success: res=>{
		// 		cb(res);
		// 	},
			
		// })

		
		let obj = {
			url:url, 
			type: "GET",
			success: res=>{
				cb(res);
          		// this.toastErrorMsg(res);
			},
			error:info=>{
				if(failCb){
					failCb(info)
				}
          		// this.toastErrorMsg(res);
			},
		};

		this.ajax(obj)
	}

	static nativePost(url, params, cb, useBaseUrl, header = false,failCb=null){
		const requestUrl = useBaseUrl ? SeverConfig.getServerConf().web + url : url;
		let obj = {
			url:requestUrl, 
			type: "POST",
			data: params,
			success: res=>{
				cb(res);
          		// this.toastErrorMsg(res);
			},
			error:info=>{
				if(failCb){
					failCb(info)
				}
          		// this.toastErrorMsg(res);
			},
		};

		this.ajax(obj, header)
	}

	static ajax(options, header = false) {
		//1.创建XMLHttpRequest对象
			options = options || {};
			// 发送请求URL
			let url = options.url;
			// 请求类型
			let type = (options.type || 'GET').toUpperCase();
			// 是否异步请求
			let async = options.async || true;
			// 是否缓存
			// 发送数据到服务器是所使用的内容类型
			let contentType= options.contentType || 'application/x-www-form-urlencoded';
			options.dataType = options.dataType || 'json';
			// 数据
			let data = options.data
			// 创建xhr对象
			let xhr =  new XMLHttpRequest();
			// GET POST
			if (type === 'GET') {
			  // 格式化参数
			  var params = this.formatParams(data);
			  xhr.open('GET', url + '?' + params, async);
			  if(!!header){
				xhr.setRequestHeader('x-bits-token', header as any);
			  }
			  xhr.send(null);
			} else {
			  var params = this.formatParams(data);
			  xhr.open('POST', url, async)
			  if(!!header){
				xhr.setRequestHeader('x-bits-token', header as any);
			  }
			  // 默认提交 表单格式
			  xhr.setRequestHeader('Content-Type', contentType);
			  xhr.send(params);
			}
			
			let t = setTimeout(() => {
				console.log("timeout 1111")
				options.error && options.error(xhr);
			}, 12000);
			// 接收
			xhr.onreadystatechange = function () {
			  if (xhr.readyState === 4) {
				var status = xhr.status;
				if (status === 200) {
					try {
						options.success && options.success(JSON.parse(xhr.responseText));
						clearTimeout(t)
					} catch(e) {
						options.error && options.error(xhr);
						clearTimeout(t)
					}
				} else {
				  options.error && options.error(xhr);
				  clearTimeout(t)
				}
			  }
			}
	}

	static formatParams(data) {
		var arr = [];
		for(var key in data) {
		  arr.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
		}

		// arr.push('rand=' + Math.random());
		return arr.join('&')
	  }
  
	

}