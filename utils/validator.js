/**
 * 验证工具 - 文件格式验证和错误处理
 */

// 支持的音频/视频格式
const SUPPORTED_FORMATS = {
	audio: ['mp3', 'wav', 'm4a', 'ogg', 'flac', 'aac', 'wma'],
	video: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'mpeg', 'mpga'],
	all: ['mp3', 'wav', 'm4a', 'ogg', 'flac', 'aac', 'wma', 'mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'mpeg', 'mpga']
}

// 文件大小限制（字节）
const FILE_SIZE_LIMITS = {
	max: 25 * 1024 * 1024, // 25MB
	min: 0 // 无最小限制
}

// 错误类型常量
export const ERROR_TYPES = {
	FILE_FORMAT: 'FILE_FORMAT',
	FILE_SIZE: 'FILE_SIZE',
	FILE_EMPTY: 'FILE_EMPTY',
	API_KEY_MISSING: 'API_KEY_MISSING',
	NETWORK_ERROR: 'NETWORK_ERROR',
	API_ERROR: 'API_ERROR',
	STORAGE_ERROR: 'STORAGE_ERROR',
	UNKNOWN_ERROR: 'UNKNOWN_ERROR'
}

/**
 * 自定义错误类
 */
export class ValidationError extends Error {
	constructor(message, type = ERROR_TYPES.UNKNOWN_ERROR, details = null) {
		super(message)
		this.name = 'ValidationError'
		this.type = type
		this.details = details
		this.timestamp = new Date().toISOString()
	}
}

/**
 * 验证文件格式
 * @param {string} fileName - 文件名
 * @param {Array} allowedFormats - 允许的格式列表，默认为所有支持的格式
 * @returns {Object} 验证结果
 */
export function validateFileFormat(fileName, allowedFormats = SUPPORTED_FORMATS.all) {
	const result = {
		isValid: false,
		fileExtension: '',
		fileType: '',
		error: null
	}
	
	try {
		if (!fileName || typeof fileName !== 'string') {
			result.error = new ValidationError('文件名无效', ERROR_TYPES.FILE_FORMAT)
			return result
		}
		
		// 提取文件扩展名
		const fileExtension = fileName.split('.').pop().toLowerCase()
		result.fileExtension = fileExtension
		
		if (!fileExtension) {
			result.error = new ValidationError('文件缺少扩展名', ERROR_TYPES.FILE_FORMAT)
			return result
		}
		
		// 检查是否为支持的格式
		if (!allowedFormats.includes(fileExtension)) {
			result.error = new ValidationError(
				`不支持的文件格式: .${fileExtension}`,
				ERROR_TYPES.FILE_FORMAT,
				{ supportedFormats: allowedFormats }
			)
			return result
		}
		
		// 确定文件类型
		if (SUPPORTED_FORMATS.audio.includes(fileExtension)) {
			result.fileType = 'audio'
		} else if (SUPPORTED_FORMATS.video.includes(fileExtension)) {
			result.fileType = 'video'
		} else {
			result.fileType = 'unknown'
		}
		
		result.isValid = true
		return result
		
	} catch (error) {
		result.error = new ValidationError(
			'文件格式验证失败',
			ERROR_TYPES.FILE_FORMAT,
			{ originalError: error.message }
		)
		return result
	}
}

/**
 * 验证文件大小
 * @param {number} fileSize - 文件大小（字节）
 * @returns {Object} 验证结果
 */
export function validateFileSize(fileSize) {
	const result = {
		isValid: false,
		formattedSize: '',
		error: null
	}
	
	try {
		if (typeof fileSize !== 'number' || fileSize < 0) {
			result.error = new ValidationError('文件大小无效', ERROR_TYPES.FILE_SIZE)
			return result
		}
		
		result.formattedSize = formatFileSize(fileSize)
		
		// 移除最小文件大小限制，允许任意大小的文件
		// if (fileSize < FILE_SIZE_LIMITS.min) {
		//		result.error = new ValidationError(
		//			`文件太小，最小大小为 ${formatFileSize(FILE_SIZE_LIMITS.min)}`,
		//			ERROR_TYPES.FILE_SIZE,
		//			{ fileSize, minSize: FILE_SIZE_LIMITS.min }
		//		)
		//		return result
		// }
		
		if (fileSize > FILE_SIZE_LIMITS.max) {
			result.error = new ValidationError(
				`文件太大，最大大小为 ${formatFileSize(FILE_SIZE_LIMITS.max)}`,
				ERROR_TYPES.FILE_SIZE,
				{ fileSize, maxSize: FILE_SIZE_LIMITS.max }
			)
			return result
		}
		
		result.isValid = true
		return result
		
	} catch (error) {
		result.error = new ValidationError(
			'文件大小验证失败',
			ERROR_TYPES.FILE_SIZE,
			{ originalError: error.message }
		)
		return result
	}
}

/**
 * 验证文件完整性
 * @param {Object} file - 文件对象
 * @returns {Object} 验证结果
 */
export function validateFile(file) {
	const result = {
		isValid: false,
		fileInfo: {},
		errors: []
	}
	
	try {
		if (!file) {
			result.errors.push(new ValidationError('文件对象为空', ERROR_TYPES.FILE_EMPTY))
			return result
		}
		
		// 验证文件名
		const fileName = file.name || file.tempFilePath || ''
		if (!fileName) {
			result.errors.push(new ValidationError('文件名为空', ERROR_TYPES.FILE_EMPTY))
			return result
		}
		
		// 验证文件格式
		const formatResult = validateFileFormat(fileName)
		if (!formatResult.isValid) {
			result.errors.push(formatResult.error)
		}
		
		// 验证文件大小
		const fileSize = file.size || 0
		const sizeResult = validateFileSize(fileSize)
		if (!sizeResult.isValid) {
			result.errors.push(sizeResult.error)
		}
		
		// 收集文件信息
		result.fileInfo = {
			name: fileName,
			size: fileSize,
			formattedSize: sizeResult.formattedSize,
			extension: formatResult.fileExtension,
			type: formatResult.fileType,
			path: file.tempFilePath || file.path || ''
		}
		
		// 如果没有错误，则验证通过
		result.isValid = result.errors.length === 0
		return result
		
	} catch (error) {
		result.errors.push(new ValidationError(
			'文件验证失败',
			ERROR_TYPES.UNKNOWN_ERROR,
			{ originalError: error.message }
		))
		return result
	}
}

/**
 * 验证API密钥
 * @param {string} apiKey - API密钥
 * @returns {Object} 验证结果
 */
export function validateApiKey(apiKey) {
	const result = {
		isValid: false,
		error: null
	}
	
	try {
		if (!apiKey || typeof apiKey !== 'string') {
			result.error = new ValidationError('API密钥为空', ERROR_TYPES.API_KEY_MISSING)
			return result
		}
		
		const trimmedKey = apiKey.trim()
		if (trimmedKey.length === 0) {
			result.error = new ValidationError('API密钥为空', ERROR_TYPES.API_KEY_MISSING)
			return result
		}
		
		// 基本格式检查（可根据实际API密钥格式调整）
		if (trimmedKey.length < 10) {
			result.error = new ValidationError('API密钥格式无效', ERROR_TYPES.API_KEY_MISSING)
			return result
		}
		
		result.isValid = true
		return result
		
	} catch (error) {
		result.error = new ValidationError(
			'API密钥验证失败',
			ERROR_TYPES.API_KEY_MISSING,
			{ originalError: error.message }
		)
		return result
	}
}

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string} 格式化后的大小
 */
export function formatFileSize(bytes) {
	if (bytes === 0) return '0 B'
	const k = 1024
	const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
	const i = Math.floor(Math.log(bytes) / Math.log(k))
	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 错误处理器
 * @param {Error} error - 错误对象
 * @param {Object} context - 错误上下文
 * @returns {Object} 处理后的错误信息
 */
export function handleError(error, context = {}) {
	const errorInfo = {
		message: '未知错误',
		type: ERROR_TYPES.UNKNOWN_ERROR,
		details: null,
		timestamp: new Date().toISOString(),
		context
	}
	
	try {
		if (error instanceof ValidationError) {
			errorInfo.message = error.message
			errorInfo.type = error.type
			errorInfo.details = error.details
		} else if (error instanceof Error) {
			errorInfo.message = error.message
			
			// 根据错误消息判断错误类型
			if (error.message.includes('network') || error.message.includes('timeout')) {
				errorInfo.type = ERROR_TYPES.NETWORK_ERROR
			} else if (error.message.includes('API') || error.message.includes('401') || error.message.includes('403')) {
				errorInfo.type = ERROR_TYPES.API_ERROR
			} else if (error.message.includes('storage') || error.message.includes('存储')) {
				errorInfo.type = ERROR_TYPES.STORAGE_ERROR
			}
		} else if (typeof error === 'string') {
			errorInfo.message = error
		} else {
			errorInfo.message = '发生了未知错误'
			errorInfo.details = error
		}
		
		// 记录错误日志
		console.error('Error handled:', errorInfo)
		
		return errorInfo
		
	} catch (handlingError) {
		console.error('Error handling failed:', handlingError)
		return {
			message: '错误处理失败',
			type: ERROR_TYPES.UNKNOWN_ERROR,
			details: { originalError: error, handlingError },
			timestamp: new Date().toISOString(),
			context
		}
	}
}

/**
 * 显示用户友好的错误消息
 * @param {Error|Object} error - 错误对象或错误信息
 * @param {Object} options - 显示选项
 */
export function showErrorMessage(error, options = {}) {
	const defaultOptions = {
		duration: 3000,
		icon: 'none',
		mask: false
	}
	
	const finalOptions = { ...defaultOptions, ...options }
	const errorInfo = handleError(error)
	
	// 根据错误类型自定义消息
	let userMessage = errorInfo.message
	switch (errorInfo.type) {
		case ERROR_TYPES.FILE_FORMAT:
			userMessage = '文件格式不支持，请选择音频或视频文件'
			break
		case ERROR_TYPES.FILE_SIZE:
			userMessage = errorInfo.message
			break
		case ERROR_TYPES.API_KEY_MISSING:
			userMessage = '请先在设置中配置API密钥'
			break
		case ERROR_TYPES.NETWORK_ERROR:
			userMessage = '网络连接失败，请检查网络设置'
			break
		case ERROR_TYPES.API_ERROR:
			userMessage = 'API调用失败，请检查密钥是否正确'
			break
		case ERROR_TYPES.STORAGE_ERROR:
			userMessage = '存储操作失败，请重试'
			break
		default:
			userMessage = errorInfo.message || '操作失败，请重试'
	}
	
	uni.showToast({
		title: userMessage,
		icon: finalOptions.icon,
		duration: finalOptions.duration,
		mask: finalOptions.mask
	})
}

/**
 * 获取支持的文件格式列表
 * @param {string} type - 文件类型 ('audio', 'video', 'all')
 * @returns {Array} 格式列表
 */
export function getSupportedFormats(type = 'all') {
	return SUPPORTED_FORMATS[type] || SUPPORTED_FORMATS.all
}

/**
 * 获取文件大小限制
 * @returns {Object} 大小限制信息
 */
export function getFileSizeLimits() {
	return {
		min: FILE_SIZE_LIMITS.min,
		max: FILE_SIZE_LIMITS.max,
		minFormatted: formatFileSize(FILE_SIZE_LIMITS.min),
		maxFormatted: formatFileSize(FILE_SIZE_LIMITS.max)
	}
}

/**
 * 检查网络连接状态
 * @returns {Promise<boolean>} 网络是否可用
 */
export function checkNetworkStatus() {
	return new Promise((resolve) => {
		uni.getNetworkType({
			success: (res) => {
				resolve(res.networkType !== 'none')
			},
			fail: () => {
				resolve(false)
			}
		})
	})
}