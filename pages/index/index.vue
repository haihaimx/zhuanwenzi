<template>
	<view class="container">
		<!-- 文件上传区域 -->
		<view class="upload-section">
			<view class="upload-area" @click="chooseFile">
				<view v-if="!selectedFile" class="upload-placeholder">
					<image class="upload-icon" src="/static/upload-icon.png"></image>
					<text class="upload-text">点击选择音频/视频文件</text>
					<text class="upload-tip">支持格式：mp3、mp4、wav、m4a等</text>
				</view>
				<view v-else class="file-selected">
					<image class="file-icon" src="/static/file-icon.png"></image>
					<text class="file-name">{{selectedFile.name}}</text>
					<text class="file-size">{{formatFileSize(selectedFile.size)}}</text>
				</view>
			</view>
			
			<!-- 转录按钮 -->
			<button 
				class="transcribe-btn" 
				:disabled="!selectedFile || isTranscribing"
				@click="startTranscription"
			>
				<text v-if="!isTranscribing">开始转录</text>
				<text v-else>转录中...</text>
			</button>
		</view>
		
		<!-- 转录结果区域 -->
		<view v-if="transcriptionResult" class="result-section">
			<view class="result-header">
				<text class="result-title">转录结果</text>
				<button class="copy-btn" @click="copyResult">复制</button>
			</view>
			<view class="result-content">
				<text class="result-text">{{transcriptionResult}}</text>
			</view>
		</view>
		
		<!-- 加载提示 -->
		<view v-if="isTranscribing" class="loading-overlay">
			<view class="loading-content">
				<view class="loading-spinner"></view>
				<text class="loading-text">正在转录中，请稍候...</text>
			</view>
		</view>
	</view>
</template>

<script>
import { transcribeAudio, hasApiKey } from '@/utils/api.js'
import { saveTranscriptionHistory } from '@/utils/storage.js'
import { validateFile, showErrorMessage, checkNetworkStatus, ERROR_TYPES } from '@/utils/validator.js'

export default {
	data() {
		return {
			selectedFile: null,
			isTranscribing: false,
			transcriptionResult: ''
		}
	},
	onLoad() {
		// 页面加载时的初始化
	},
	methods: {
		// 选择文件
		chooseFile() {
			// 显示选择文件类型的弹窗
			uni.showActionSheet({
				itemList: ['选择视频文件', '选择音频文件'],
				success: (res) => {
					if (res.tapIndex === 0) {
						// 选择视频文件
						this.chooseVideoFile()
					} else if (res.tapIndex === 1) {
						// 选择音频文件
						this.chooseAudioFile()
					}
				}
			})
		},
		
		// 选择视频文件
		chooseVideoFile() {
			uni.chooseMedia({
				count: 1,
				mediaType: ['video'],
				sourceType: ['album', 'camera'],
				maxDuration: 300,
				camera: 'back',
				success: (res) => {
					this.handleFileSelection(res.tempFiles[0])
				},
				fail: (err) => {
					showErrorMessage('选择视频文件失败，请重试')
				}
			})
		},
		
		// 选择音频文件
		chooseAudioFile() {
			uni.chooseFile({
				count: 1,
				type: 'all',
				extension: ['.mp3', '.wav', '.m4a', '.ogg', '.flac', '.aac', '.wma'],
				success: (res) => {
					this.handleFileSelection(res.tempFiles[0])
				},
				fail: (err) => {
					showErrorMessage('选择音频文件失败，请重试')
				}
			})
		},
		
		// 处理文件选择结果
		handleFileSelection(file) {
			// 从文件路径中提取文件名和扩展名
			const fileName = this.extractFileName(file.tempFilePath, file.name)
			const fileWithName = {
				...file,
				name: fileName
			}
			
			if (this.validateFileInput(fileWithName)) {
				this.selectedFile = {
					path: file.tempFilePath,
					name: fileName,
					size: file.size
				}
				this.transcriptionResult = ''
			}
		},
		
		// 验证文件
		validateFileInput(file) {
			const validationResult = validateFile(file)
			
			if (!validationResult.isValid) {
				// 显示第一个错误
				if (validationResult.errors.length > 0) {
					showErrorMessage(validationResult.errors[0])
				}
				return false
			}
			
			return true
		},
		
		// 开始转录
		async startTranscription() {
			if (!this.selectedFile) return
			
			// 检查API密钥
			if (!hasApiKey()) {
				uni.showModal({
					title: '需要配置API密钥',
					content: '请先在设置中配置API密钥才能使用转录功能',
					confirmText: '去设置',
					cancelText: '取消',
					success: (res) => {
						if (res.confirm) {
							uni.navigateTo({
								url: '/pages/settings/settings'
							})
						}
					}
				})
				return
			}
			
			// 检查网络连接
			const isNetworkAvailable = await checkNetworkStatus()
			if (!isNetworkAvailable) {
				showErrorMessage('网络连接不可用，请检查网络设置', { type: ERROR_TYPES.NETWORK_ERROR })
				return
			}
			
			this.isTranscribing = true
			try {
				const result = await transcribeAudio(this.selectedFile.path)
				this.transcriptionResult = result.text
				
				// 保存到历史记录
				await saveTranscriptionHistory({
					fileName: this.selectedFile.name,
					result: result.text,
					timestamp: new Date().getTime(),
					fileSize: this.formatFileSize(this.selectedFile.size)
				})
				
				uni.showToast({
					title: '转录完成',
					icon: 'success'
				})
			} catch (error) {
				showErrorMessage(error, { context: 'transcription' })
			} finally {
				this.isTranscribing = false
			}
		},
		
		// 复制结果
		copyResult() {
			uni.setClipboardData({
				data: this.transcriptionResult,
				success: () => {
					uni.showToast({
						title: '已复制到剪贴板',
						icon: 'success'
					})
				}
			})
		},
		
		// 格式化文件大小
		formatFileSize(bytes) {
			if (bytes === 0) return '0 B'
			const k = 1024
			const sizes = ['B', 'KB', 'MB', 'GB']
			const i = Math.floor(Math.log(bytes) / Math.log(k))
			return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
		},
		
		// 提取文件名和扩展名
		extractFileName(filePath, originalName) {
			// 如果有原始文件名且包含扩展名，直接使用
			if (originalName && originalName.includes('.')) {
				return originalName
			}
			
			// 从文件路径中提取
			if (filePath) {
				// 移除路径中的特殊字符和目录
				const cleanPath = filePath.replace(/.*[\/\\]/, '')
				
				// 检查是否包含扩展名
				if (cleanPath.includes('.')) {
					return cleanPath
				}
				
				// 如果路径中没有扩展名，尝试从MIME类型推断
				// 对于视频文件，默认添加.mp4扩展名
				return cleanPath + '.mp4'
			}
			
			// 默认返回
			return '未知文件.mp4'
		}
	}
}
</script>

<style scoped>
.container {
	padding: 40rpx;
	min-height: 100vh;
	background-color: #f5f5f5;
}

.upload-section {
	margin-bottom: 40rpx;
}

.upload-area {
	border: 2rpx dashed #007AFF;
	border-radius: 20rpx;
	padding: 80rpx 40rpx;
	text-align: center;
	background-color: #ffffff;
	margin-bottom: 40rpx;
}

.upload-placeholder {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.upload-icon {
	width: 120rpx;
	height: 120rpx;
	margin-bottom: 20rpx;
}

.upload-text {
	font-size: 32rpx;
	color: #333333;
	margin-bottom: 10rpx;
}

.upload-tip {
	font-size: 24rpx;
	color: #999999;
}

.file-selected {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.file-icon {
	width: 80rpx;
	height: 80rpx;
	margin-bottom: 20rpx;
}

.file-name {
	font-size: 28rpx;
	color: #333333;
	margin-bottom: 10rpx;
	max-width: 500rpx;
	text-overflow: ellipsis;
	white-space: nowrap;
	overflow: hidden;
}

.file-size {
	font-size: 24rpx;
	color: #999999;
}

.transcribe-btn {
	width: 100%;
	height: 88rpx;
	background-color: #007AFF;
	color: #ffffff;
	border-radius: 44rpx;
	font-size: 32rpx;
	border: none;
	outline: none;
}

.transcribe-btn:disabled {
	background-color: #cccccc;
	color: #999999;
}

.result-section {
	background-color: #ffffff;
	border-radius: 20rpx;
	padding: 40rpx;
	margin-bottom: 40rpx;
}

.result-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 30rpx;
}

.result-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333333;
}

.copy-btn {
	padding: 10rpx 30rpx;
	background-color: #007AFF;
	color: #ffffff;
	border-radius: 20rpx;
	font-size: 24rpx;
	border: none;
}

.result-content {
	min-height: 200rpx;
	padding: 30rpx;
	background-color: #f8f8f8;
	border-radius: 15rpx;
}

.result-text {
	font-size: 28rpx;
	line-height: 1.6;
	color: #333333;
	word-wrap: break-word;
}

.loading-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 9999;
}

.loading-content {
	background-color: #ffffff;
	border-radius: 20rpx;
	padding: 60rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.loading-spinner {
	width: 60rpx;
	height: 60rpx;
	border: 4rpx solid #f3f3f3;
	border-top: 4rpx solid #007AFF;
	border-radius: 50%;
	animation: spin 1s linear infinite;
	margin-bottom: 30rpx;
}

@keyframes spin {
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
}

.loading-text {
	font-size: 28rpx;
	color: #333333;
}
</style>
