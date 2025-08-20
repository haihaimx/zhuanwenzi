<template>
	<view class="container">
		<!-- API状态显示 -->
		<view class="card">
			<view class="card-header">
				<text class="card-title">API状态</text>
				<button class="btn btn-secondary" @click="testConnection">测试连接</button>
			</view>
			<view class="card-content">
				<view class="status-info">
					<view class="status-item">
						<text class="status-label">API密钥状态</text>
						<text class="status-value success">已配置</text>
					</view>
					<view class="status-item">
						<text class="status-label">服务地址</text>
						<text class="status-value">https://api.lightai.io</text>
					</view>
				</view>
				<text class="help-text">API密钥已内置，无需手动配置</text>
			</view>
		</view>
		
		<!-- 转录设置 -->
		<view class="card">
			<view class="card-header">
				<text class="card-title">转录设置</text>
			</view>
			<view class="card-content">
				<view class="setting-item">
					<text class="setting-label">默认语言</text>
					<picker 
						:value="languageIndex" 
						:range="languageOptions" 
						range-key="name"
						@change="onLanguageChange"
					>
						<view class="picker-value">
							{{languageOptions[languageIndex].name}}
							<text class="picker-arrow">></text>
						</view>
					</picker>
				</view>
				
				<view class="setting-item">
					<text class="setting-label">采样温度</text>
					<slider 
						:value="temperature" 
						:min="0" 
						:max="1" 
						:step="0.1"
						@change="onTemperatureChange"
						show-value
					/>
					<text class="setting-desc">较低的值使输出更确定，较高的值使输出更随机</text>
				</view>
				
				<view class="setting-item">
					<view class="setting-row">
						<text class="setting-label">自动保存历史</text>
						<switch 
							:checked="autoSave" 
							@change="onAutoSaveChange"
							color="#007AFF"
						/>
					</view>
					<text class="setting-desc">转录完成后自动保存到历史记录</text>
				</view>
			</view>
		</view>
		
		<!-- 存储设置 -->
		<view class="card">
			<view class="card-header">
				<text class="card-title">存储管理</text>
			</view>
			<view class="card-content">
				<view class="storage-info">
					<view class="info-item">
						<text class="info-label">历史记录数量</text>
						<text class="info-value">{{historyCount}} 条</text>
					</view>
					<view class="info-item">
						<text class="info-label">总字数</text>
						<text class="info-value">{{totalWords}} 字</text>
					</view>
				</view>
				
				<view class="storage-actions">
					<button class="btn btn-secondary" @click="exportHistory">导出历史</button>
					<button class="btn btn-secondary" @click="importHistory">导入历史</button>
					<button class="btn btn-danger" @click="clearHistory">清空历史</button>
				</view>
			</view>
		</view>
		
		<!-- 关于应用 -->
		<view class="card">
			<view class="card-header">
				<text class="card-title">关于应用</text>
			</view>
			<view class="card-content">
				<view class="about-info">
					<view class="info-item">
						<text class="info-label">应用名称</text>
						<text class="info-value">音频转文字</text>
					</view>
					<view class="info-item">
						<text class="info-label">版本号</text>
						<text class="info-value">1.0.0</text>
					</view>
					<view class="info-item">
						<text class="info-label">支持格式</text>
						<text class="info-value">mp3, mp4, wav, m4a, ogg, webm, flac</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { getApiKey, setApiKey, testApiConnection, getSupportedLanguages } from '@/utils/api.js'
import { getAppSettings, saveAppSettings, getHistoryStatistics, clearTranscriptionHistory, exportHistoryAsJson, importHistoryFromJson } from '@/utils/storage.js'

export default {
	data() {
		return {
			languageOptions: [],
			languageIndex: 0,
			temperature: 0,
			autoSave: true,
			historyCount: 0,
			totalWords: 0
		}
	},
	onLoad() {
		this.loadSettings()
		this.loadStatistics()
	},
	onShow() {
		this.loadStatistics()
	},
	methods: {
		// 加载设置
		async loadSettings() {
			try {
				// 加载语言选项
				this.languageOptions = getSupportedLanguages()
				
				// 加载应用设置
				const settings = await getAppSettings()
				this.languageIndex = this.languageOptions.findIndex(lang => lang.code === settings.language) || 0
				this.temperature = settings.temperature || 0
				this.autoSave = settings.autoSave !== false
			} catch (error) {
				console.error('加载设置失败:', error)
			}
		},
		
		// 加载统计信息
		async loadStatistics() {
			try {
				const stats = await getHistoryStatistics()
				this.historyCount = stats.totalRecords
				this.totalWords = stats.totalWords
			} catch (error) {
				console.error('加载统计信息失败:', error)
			}
		},
		

		// 测试API连接
		async testConnection() {
			uni.showLoading({
				title: '测试连接中...'
			})
			
			try {
				await testApiConnection()
				uni.hideLoading()
				uni.showToast({
					title: 'API连接成功',
					icon: 'success'
				})
			} catch (error) {
				uni.hideLoading()
				uni.showToast({
					title: 'API连接失败：' + error.message,
					icon: 'none',
					duration: 3000
				})
			}
		},
		
		// 语言选择变化
		async onLanguageChange(e) {
			this.languageIndex = e.detail.value
			await this.saveSettings()
		},
		
		// 温度变化
		async onTemperatureChange(e) {
			this.temperature = e.detail.value
			await this.saveSettings()
		},
		
		// 自动保存变化
		async onAutoSaveChange(e) {
			this.autoSave = e.detail.value
			await this.saveSettings()
		},
		
		// 保存设置
		async saveSettings() {
			try {
				const settings = {
					language: this.languageOptions[this.languageIndex].code,
					temperature: this.temperature,
					autoSave: this.autoSave
				}
				await saveAppSettings(settings)
			} catch (error) {
				console.error('保存设置失败:', error)
			}
		},
		
		// 导出历史记录
		async exportHistory() {
			try {
				const jsonData = await exportHistoryAsJson()
				// 这里可以实现文件保存功能
				uni.showToast({
					title: '导出成功',
					icon: 'success'
				})
				console.log('导出数据:', jsonData)
			} catch (error) {
				uni.showToast({
					title: '导出失败',
					icon: 'none'
				})
			}
		},
		
		// 导入历史记录
		importHistory() {
			// 这里可以实现文件选择功能
			uni.showToast({
				title: '功能开发中',
				icon: 'none'
			})
		},
		
		// 清空历史记录
		clearHistory() {
			uni.showModal({
				title: '确认清空',
				content: '确定要清空所有历史记录吗？此操作不可恢复。',
				success: async (res) => {
					if (res.confirm) {
						try {
							await clearTranscriptionHistory()
							this.loadStatistics()
							uni.showToast({
								title: '清空成功',
								icon: 'success'
							})
						} catch (error) {
							uni.showToast({
								title: '清空失败',
								icon: 'none'
							})
						}
					}
				}
			})
		}
	}
}
</script>

<style scoped>
.container {
	padding: 20rpx;
	min-height: 100vh;
	background-color: #f5f5f5;
}

.input-group {
	margin-bottom: 30rpx;
}

.input-label {
	display: block;
	font-size: 28rpx;
	color: #333333;
	margin-bottom: 15rpx;
	font-weight: 500;
}

.input-actions {
	display: flex;
	gap: 20rpx;
	margin-top: 20rpx;
}

.help-text {
	font-size: 24rpx;
	color: #999999;
	line-height: 1.5;
	margin-top: 15rpx;
}

.status-info {
	margin-bottom: 30rpx;
}

.status-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx 0;
	border-bottom: 1rpx solid #f0f0f0;
}

.status-item:last-child {
	border-bottom: none;
}

.status-label {
	font-size: 28rpx;
	color: #333333;
	font-weight: 500;
}

.status-value {
	font-size: 28rpx;
	color: #666666;
}

.status-value.success {
	color: #34C759;
	font-weight: 500;
}

.setting-item {
	margin-bottom: 40rpx;
}

.setting-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 15rpx;
}

.setting-label {
	font-size: 28rpx;
	color: #333333;
	font-weight: 500;
	margin-bottom: 15rpx;
}

.setting-desc {
	font-size: 24rpx;
	color: #999999;
	line-height: 1.5;
	margin-top: 10rpx;
}

.picker-value {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 24rpx 30rpx;
	border: 2rpx solid #e0e0e0;
	border-radius: 12rpx;
	background-color: #ffffff;
	font-size: 28rpx;
	color: #333333;
}

.picker-arrow {
	color: #999999;
	font-size: 24rpx;
}

.storage-info {
	margin-bottom: 30rpx;
}

.info-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx 0;
	border-bottom: 1rpx solid #f0f0f0;
}

.info-item:last-child {
	border-bottom: none;
}

.info-label {
	font-size: 28rpx;
	color: #333333;
}

.info-value {
	font-size: 28rpx;
	color: #007AFF;
	font-weight: 500;
}

.storage-actions {
	display: flex;
	gap: 20rpx;
	flex-wrap: wrap;
}

.storage-actions .btn {
	flex: 1;
	min-width: 200rpx;
}

.about-info .info-item {
	align-items: flex-start;
}

.about-info .info-value {
	color: #333333;
	font-weight: normal;
	text-align: right;
	flex: 1;
	margin-left: 20rpx;
	word-wrap: break-word;
}
</style>