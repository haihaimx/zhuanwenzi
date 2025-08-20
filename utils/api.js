/**
 * API服务文件 - 封装音频转录接口调用
 */

// API配置
const API_CONFIG = {
	baseURL: 'https://api.lightai.io/v1',
	apiKey: 'sk-ZAaqR8Us17y9HhF5447aDbFdE2Fa4a738029Cf6c6f7a8336', // 内置API密钥
	timeout: 60000 // 60秒超时
}

/**
 * 设置API密钥
 * @param {string} apiKey - API密钥
 */
export function setApiKey(apiKey) {
	API_CONFIG.apiKey = apiKey
	// 保存到本地存储
	uni.setStorageSync('api_key', apiKey)
}

/**
 * 获取API密钥
 * @returns {string} API密钥
 */
export function getApiKey() {
	// 优先使用内置密钥，如果没有则从存储中获取
	if (!API_CONFIG.apiKey) {
		API_CONFIG.apiKey = uni.getStorageSync('api_key') || 'sk-ZAaqR8Us17y9HhF5447aDbFdE2Fa4a738029Cf6c6f7a8336'
	}
	return API_CONFIG.apiKey
}

/**
 * 检查API密钥是否已配置
 * @returns {boolean} 是否已配置
 */
export function hasApiKey() {
	// 由于已内置API密钥，始终返回true
	return true
}

/**
 * 音频转录接口
 * @param {string} filePath - 音频文件路径
 * @param {Object} options - 转录选项
 * @param {string} options.model - 模型名称，默认为 'whisper-1'
 * @param {string} options.language - 语言代码，如 'zh' 表示中文
 * @param {string} options.prompt - 提示文本
 * @param {string} options.response_format - 响应格式，默认为 'json'
 * @param {number} options.temperature - 采样温度，默认为 0
 * @returns {Promise<Object>} 转录结果
 */
export function transcribeAudio(filePath, options = {}) {
	return new Promise((resolve, reject) => {
		// 检查API密钥
		const apiKey = getApiKey()
		if (!apiKey) {
			reject(new Error('请先配置API密钥'))
			return
		}
		
		// 默认参数
		const defaultOptions = {
			model: 'whisper-1',
			language: 'zh',
			response_format: 'json',
			temperature: 0
		}
		
		const params = { ...defaultOptions, ...options }
		
		// 显示加载提示
		uni.showLoading({
			title: '正在上传文件...',
			mask: true
		})
		
		// 使用uni.uploadFile上传文件
		uni.uploadFile({
			url: `${API_CONFIG.baseURL}/audio/transcriptions`,
			filePath: filePath,
			name: 'file',
			header: {
				'Authorization': `Bearer ${apiKey}`
			},
			formData: {
				model: params.model,
				language: params.language,
				response_format: params.response_format,
				temperature: params.temperature.toString(),
				...(params.prompt && { prompt: params.prompt })
			},
			timeout: API_CONFIG.timeout,
			success: (res) => {
				uni.hideLoading()
				
				try {
					// 解析响应数据
					let data
					if (typeof res.data === 'string') {
						data = JSON.parse(res.data)
					} else {
						data = res.data
					}
					
					// 检查响应状态
					if (res.statusCode === 200) {
						if (data.text) {
							resolve(data)
						} else {
							reject(new Error('转录结果为空'))
						}
					} else {
						// 处理API错误
						const errorMessage = data.error?.message || data.message || `请求失败 (${res.statusCode})`
						reject(new Error(errorMessage))
					}
				} catch (parseError) {
					console.error('解析响应数据失败:', parseError)
					reject(new Error('解析响应数据失败'))
				}
			},
			fail: (error) => {
				uni.hideLoading()
				console.error('上传文件失败:', error)
				
				// 处理不同类型的错误
				let errorMessage = '转录失败'
				if (error.errMsg) {
					if (error.errMsg.includes('timeout')) {
						errorMessage = '请求超时，请检查网络连接'
					} else if (error.errMsg.includes('network')) {
						errorMessage = '网络连接失败'
					} else if (error.errMsg.includes('file')) {
						errorMessage = '文件上传失败'
					} else {
						errorMessage = error.errMsg
					}
				}
				
				reject(new Error(errorMessage))
			}
		})
	})
}

/**
 * 测试API连接
 * @returns {Promise<boolean>} 连接是否成功
 */
export function testApiConnection() {
	return new Promise((resolve, reject) => {
		const apiKey = getApiKey()
		if (!apiKey) {
			reject(new Error('请先配置API密钥'))
			return
		}
		
		// 发送测试请求
		uni.request({
			url: `${API_CONFIG.baseURL}/models`,
			method: 'GET',
			header: {
				'Authorization': `Bearer ${apiKey}`,
				'Content-Type': 'application/json'
			},
			timeout: 10000,
			success: (res) => {
				if (res.statusCode === 200) {
					resolve(true)
				} else {
					reject(new Error(`API连接失败 (${res.statusCode})`))
				}
			},
			fail: (error) => {
				reject(new Error('API连接失败：' + (error.errMsg || '未知错误')))
			}
		})
	})
}

/**
 * 获取支持的模型列表
 * @returns {Promise<Array>} 模型列表
 */
export function getModels() {
	return new Promise((resolve, reject) => {
		const apiKey = getApiKey()
		if (!apiKey) {
			reject(new Error('请先配置API密钥'))
			return
		}
		
		uni.request({
			url: `${API_CONFIG.baseURL}/models`,
			method: 'GET',
			header: {
				'Authorization': `Bearer ${apiKey}`,
				'Content-Type': 'application/json'
			},
			success: (res) => {
				if (res.statusCode === 200) {
					resolve(res.data.data || [])
				} else {
					reject(new Error(`获取模型列表失败 (${res.statusCode})`))
				}
			},
			fail: (error) => {
				reject(new Error('获取模型列表失败：' + (error.errMsg || '未知错误')))
			}
		})
	})
}

/**
 * 验证文件格式
 * @param {string} fileName - 文件名
 * @returns {boolean} 是否支持的格式
 */
export function validateFileFormat(fileName) {
	const supportedFormats = ['flac', 'mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'ogg', 'wav', 'webm']
	const fileExt = fileName.split('.').pop().toLowerCase()
	return supportedFormats.includes(fileExt)
}

/**
 * 验证文件大小
 * @param {number} fileSize - 文件大小（字节）
 * @returns {boolean} 是否符合大小限制
 */
export function validateFileSize(fileSize) {
	const maxSize = 25 * 1024 * 1024 // 25MB
	return fileSize <= maxSize
}

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string} 格式化后的大小
 */
export function formatFileSize(bytes) {
	if (bytes === 0) return '0 B'
	const k = 1024
	const sizes = ['B', 'KB', 'MB', 'GB']
	const i = Math.floor(Math.log(bytes) / Math.log(k))
	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 获取支持的语言列表
 * @returns {Array} 语言列表
 */
export function getSupportedLanguages() {
	return [
		{ code: 'zh', name: '中文' },
		{ code: 'en', name: 'English' },
		{ code: 'ja', name: '日本語' },
		{ code: 'ko', name: '한국어' },
		{ code: 'fr', name: 'Français' },
		{ code: 'de', name: 'Deutsch' },
		{ code: 'es', name: 'Español' },
		{ code: 'ru', name: 'Русский' },
		{ code: 'ar', name: 'العربية' },
		{ code: 'hi', name: 'हिन्दी' }
	]
}