/**
 * 本地存储工具 - 管理转录历史记录
 */

// 存储键名常量
const STORAGE_KEYS = {
	HISTORY: 'transcription_history',
	SETTINGS: 'app_settings',
	API_KEY: 'api_key'
}

/**
 * 保存转录历史记录
 * @param {Object} record - 转录记录
 * @param {string} record.fileName - 文件名
 * @param {string} record.result - 转录结果
 * @param {number} record.timestamp - 时间戳
 * @param {string} record.fileSize - 文件大小（可选）
 * @param {string} record.duration - 音频时长（可选）
 * @param {string} record.language - 语言（可选）
 * @returns {Promise<boolean>} 保存是否成功
 */
export function saveTranscriptionHistory(record) {
	return new Promise((resolve, reject) => {
		try {
			// 验证必要字段
			if (!record.fileName || !record.result || !record.timestamp) {
				reject(new Error('缺少必要的记录字段'))
				return
			}
			
			// 获取现有历史记录
			const existingHistory = getTranscriptionHistorySync()
			
			// 创建新记录
			const newRecord = {
				id: generateId(),
				fileName: record.fileName,
				result: record.result,
				timestamp: record.timestamp,
				fileSize: record.fileSize || '',
				duration: record.duration || '',
				language: record.language || 'zh',
				createdAt: new Date().toISOString()
			}
			
			// 添加到历史记录开头
			existingHistory.unshift(newRecord)
			
			// 限制历史记录数量（最多保存100条）
			if (existingHistory.length > 100) {
				existingHistory.splice(100)
			}
			
			// 保存到本地存储
			uni.setStorage({
				key: STORAGE_KEYS.HISTORY,
				data: existingHistory,
				success: () => {
					resolve(true)
				},
				fail: (error) => {
					console.error('保存历史记录失败:', error)
					reject(new Error('保存历史记录失败'))
				}
			})
		} catch (error) {
			console.error('保存历史记录异常:', error)
			reject(error)
		}
	})
}

/**
 * 获取转录历史记录（异步）
 * @returns {Promise<Array>} 历史记录列表
 */
export function getTranscriptionHistory() {
	return new Promise((resolve, reject) => {
		uni.getStorage({
			key: STORAGE_KEYS.HISTORY,
			success: (res) => {
				const history = Array.isArray(res.data) ? res.data : []
				resolve(history)
			},
			fail: () => {
				// 如果没有历史记录，返回空数组
				resolve([])
			}
		})
	})
}

/**
 * 获取转录历史记录（同步）
 * @returns {Array} 历史记录列表
 */
export function getTranscriptionHistorySync() {
	try {
		const history = uni.getStorageSync(STORAGE_KEYS.HISTORY)
		return Array.isArray(history) ? history : []
	} catch (error) {
		console.error('获取历史记录失败:', error)
		return []
	}
}

/**
 * 删除指定的转录历史记录
 * @param {number} index - 记录索引
 * @returns {Promise<boolean>} 删除是否成功
 */
export function deleteTranscriptionHistory(index) {
	return new Promise((resolve, reject) => {
		try {
			const history = getTranscriptionHistorySync()
			
			if (index < 0 || index >= history.length) {
				reject(new Error('无效的记录索引'))
				return
			}
			
			// 删除指定记录
			history.splice(index, 1)
			
			// 保存更新后的历史记录
			uni.setStorage({
				key: STORAGE_KEYS.HISTORY,
				data: history,
				success: () => {
					resolve(true)
				},
				fail: (error) => {
					console.error('删除历史记录失败:', error)
					reject(new Error('删除历史记录失败'))
				}
			})
		} catch (error) {
			console.error('删除历史记录异常:', error)
			reject(error)
		}
	})
}

/**
 * 根据ID删除转录历史记录
 * @param {string} id - 记录ID
 * @returns {Promise<boolean>} 删除是否成功
 */
export function deleteTranscriptionHistoryById(id) {
	return new Promise((resolve, reject) => {
		try {
			const history = getTranscriptionHistorySync()
			const index = history.findIndex(item => item.id === id)
			
			if (index === -1) {
				reject(new Error('未找到指定的记录'))
				return
			}
			
			// 删除指定记录
			history.splice(index, 1)
			
			// 保存更新后的历史记录
			uni.setStorage({
				key: STORAGE_KEYS.HISTORY,
				data: history,
				success: () => {
					resolve(true)
				},
				fail: (error) => {
					console.error('删除历史记录失败:', error)
					reject(new Error('删除历史记录失败'))
				}
			})
		} catch (error) {
			console.error('删除历史记录异常:', error)
			reject(error)
		}
	})
}

/**
 * 清空所有转录历史记录
 * @returns {Promise<boolean>} 清空是否成功
 */
export function clearTranscriptionHistory() {
	return new Promise((resolve, reject) => {
		uni.removeStorage({
			key: STORAGE_KEYS.HISTORY,
			success: () => {
				resolve(true)
			},
			fail: (error) => {
				console.error('清空历史记录失败:', error)
				reject(new Error('清空历史记录失败'))
			}
		})
	})
}

/**
 * 搜索转录历史记录
 * @param {string} keyword - 搜索关键词
 * @returns {Promise<Array>} 搜索结果
 */
export function searchTranscriptionHistory(keyword) {
	return new Promise((resolve, reject) => {
		try {
			if (!keyword || keyword.trim() === '') {
				resolve([])
				return
			}
			
			const history = getTranscriptionHistorySync()
			const lowerKeyword = keyword.toLowerCase().trim()
			
			const results = history.filter(item => {
				return item.fileName.toLowerCase().includes(lowerKeyword) ||
					   item.result.toLowerCase().includes(lowerKeyword)
			})
			
			resolve(results)
		} catch (error) {
			console.error('搜索历史记录异常:', error)
			reject(error)
		}
	})
}

/**
 * 获取历史记录统计信息
 * @returns {Promise<Object>} 统计信息
 */
export function getHistoryStatistics() {
	return new Promise((resolve, reject) => {
		try {
			const history = getTranscriptionHistorySync()
			
			const stats = {
				totalRecords: history.length,
				totalWords: history.reduce((sum, item) => sum + item.result.length, 0),
				lastTranscription: history.length > 0 ? history[0].timestamp : null,
				languageDistribution: {}
			}
			
			// 统计语言分布
			history.forEach(item => {
				const lang = item.language || 'unknown'
				stats.languageDistribution[lang] = (stats.languageDistribution[lang] || 0) + 1
			})
			
			resolve(stats)
		} catch (error) {
			console.error('获取统计信息异常:', error)
			reject(error)
		}
	})
}

/**
 * 保存应用设置
 * @param {Object} settings - 设置对象
 * @returns {Promise<boolean>} 保存是否成功
 */
export function saveAppSettings(settings) {
	return new Promise((resolve, reject) => {
		uni.setStorage({
			key: STORAGE_KEYS.SETTINGS,
			data: settings,
			success: () => {
				resolve(true)
			},
			fail: (error) => {
				console.error('保存设置失败:', error)
				reject(new Error('保存设置失败'))
			}
		})
	})
}

/**
 * 获取应用设置
 * @returns {Promise<Object>} 设置对象
 */
export function getAppSettings() {
	return new Promise((resolve, reject) => {
		uni.getStorage({
			key: STORAGE_KEYS.SETTINGS,
			success: (res) => {
				resolve(res.data || {})
			},
			fail: () => {
				// 返回默认设置
				resolve(getDefaultSettings())
			}
		})
	})
}

/**
 * 获取默认设置
 * @returns {Object} 默认设置
 */
function getDefaultSettings() {
	return {
		language: 'zh',
		autoSave: true,
		maxHistoryCount: 100,
		theme: 'light',
		notifications: true
	}
}

/**
 * 生成唯一ID
 * @returns {string} 唯一ID
 */
function generateId() {
	return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

/**
 * 导出历史记录为JSON
 * @returns {Promise<string>} JSON字符串
 */
export function exportHistoryAsJson() {
	return new Promise((resolve, reject) => {
		try {
			const history = getTranscriptionHistorySync()
			const exportData = {
				version: '1.0',
				exportTime: new Date().toISOString(),
				records: history
			}
			resolve(JSON.stringify(exportData, null, 2))
		} catch (error) {
			console.error('导出历史记录异常:', error)
			reject(error)
		}
	})
}

/**
 * 从JSON导入历史记录
 * @param {string} jsonString - JSON字符串
 * @returns {Promise<boolean>} 导入是否成功
 */
export function importHistoryFromJson(jsonString) {
	return new Promise((resolve, reject) => {
		try {
			const importData = JSON.parse(jsonString)
			
			if (!importData.records || !Array.isArray(importData.records)) {
				reject(new Error('无效的导入数据格式'))
				return
			}
			
			// 合并现有历史记录
			const existingHistory = getTranscriptionHistorySync()
			const mergedHistory = [...importData.records, ...existingHistory]
			
			// 去重（基于时间戳和文件名）
			const uniqueHistory = mergedHistory.filter((item, index, self) => {
				return index === self.findIndex(t => 
					t.timestamp === item.timestamp && t.fileName === item.fileName
				)
			})
			
			// 按时间排序
			uniqueHistory.sort((a, b) => b.timestamp - a.timestamp)
			
			// 限制数量
			if (uniqueHistory.length > 100) {
				uniqueHistory.splice(100)
			}
			
			// 保存合并后的历史记录
			uni.setStorage({
				key: STORAGE_KEYS.HISTORY,
				data: uniqueHistory,
				success: () => {
					resolve(true)
				},
				fail: (error) => {
					console.error('导入历史记录失败:', error)
					reject(new Error('导入历史记录失败'))
				}
			})
		} catch (error) {
			console.error('导入历史记录异常:', error)
			reject(new Error('导入数据格式错误'))
		}
	})
}