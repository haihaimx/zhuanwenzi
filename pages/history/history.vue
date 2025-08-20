<template>
	<view class="container">
		<!-- 搜索栏 -->
		<view class="search-section">
			<view class="search-box">
				<image class="search-icon" src="/static/search-icon.png"></image>
				<input 
					class="search-input" 
					placeholder="搜索转录记录" 
					v-model="searchKeyword"
					@input="onSearchInput"
				/>
				<view v-if="searchKeyword" class="clear-btn" @click="clearSearch">
					<text>×</text>
				</view>
			</view>
		</view>
		
		<!-- 历史记录列表 -->
		<view v-if="filteredHistory.length > 0" class="history-list">
			<view 
				v-for="(item, index) in filteredHistory" 
				:key="index" 
				class="history-item"
				@click="viewDetail(item)"
			>
				<view class="item-header">
					<view class="file-info">
						<image class="file-icon" src="/static/file-icon.png"></image>
						<text class="file-name">{{item.fileName}}</text>
					</view>
					<view class="item-actions">
						<button class="copy-btn" @click.stop="copyText(item.result)">复制</button>
						<button class="delete-btn" @click.stop="deleteItem(index)">删除</button>
					</view>
				</view>
				<view class="item-content">
					<text class="result-preview">{{getPreviewText(item.result)}}</text>
				</view>
				<view class="item-footer">
					<text class="timestamp">{{formatTime(item.timestamp)}}</text>
					<text class="word-count">{{getWordCount(item.result)}} 字</text>
				</view>
			</view>
		</view>
		
		<!-- 空状态 -->
		<view v-else class="empty-state">
			<image class="empty-icon" src="/static/empty-icon.png"></image>
			<text class="empty-text">{{searchKeyword ? '未找到相关记录' : '暂无转录记录'}}</text>
			<text class="empty-tip">{{searchKeyword ? '尝试其他关键词' : '去首页开始转录吧'}}</text>
		</view>
		
		<!-- 详情弹窗 -->
		<view v-if="showDetail" class="detail-modal" @click="closeDetail">
			<view class="detail-content" @click.stop>
				<view class="detail-header">
					<text class="detail-title">转录详情</text>
					<button class="close-btn" @click="closeDetail">×</button>
				</view>
				<view class="detail-info">
					<view class="info-row">
						<text class="info-label">文件名：</text>
						<text class="info-value">{{selectedItem.fileName}}</text>
					</view>
					<view class="info-row">
						<text class="info-label">转录时间：</text>
						<text class="info-value">{{formatTime(selectedItem.timestamp)}}</text>
					</view>
					<view class="info-row">
						<text class="info-label">字数统计：</text>
						<text class="info-value">{{getWordCount(selectedItem.result)}} 字</text>
					</view>
				</view>
				<view class="detail-result">
					<text class="result-title">转录结果：</text>
					<view class="result-text-container">
						<text class="result-text">{{selectedItem.result}}</text>
					</view>
				</view>
				<view class="detail-actions">
					<button class="action-btn copy-btn" @click="copyText(selectedItem.result)">复制文本</button>
					<button class="action-btn share-btn" @click="shareText(selectedItem.result)">分享</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { getTranscriptionHistory, deleteTranscriptionHistory } from '@/utils/storage.js'

export default {
	data() {
		return {
			historyList: [],
			searchKeyword: '',
			showDetail: false,
			selectedItem: {}
		}
	},
	computed: {
		filteredHistory() {
			if (!this.searchKeyword) {
				return this.historyList
			}
			return this.historyList.filter(item => 
				item.fileName.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
				item.result.toLowerCase().includes(this.searchKeyword.toLowerCase())
			)
		}
	},
	onShow() {
		this.loadHistory()
	},
	methods: {
		// 加载历史记录
		async loadHistory() {
			try {
				this.historyList = await getTranscriptionHistory()
				// 按时间倒序排列
				this.historyList.sort((a, b) => b.timestamp - a.timestamp)
			} catch (error) {
				console.error('加载历史记录失败:', error)
			}
		},
		
		// 搜索输入
		onSearchInput() {
			// 实时搜索，这里可以添加防抖逻辑
		},
		
		// 清除搜索
		clearSearch() {
			this.searchKeyword = ''
		},
		
		// 查看详情
		viewDetail(item) {
			this.selectedItem = item
			this.showDetail = true
		},
		
		// 关闭详情
		closeDetail() {
			this.showDetail = false
			this.selectedItem = {}
		},
		
		// 复制文本
		copyText(text) {
			uni.setClipboardData({
				data: text,
				success: () => {
					uni.showToast({
						title: '已复制到剪贴板',
						icon: 'success'
					})
				}
			})
		},
		
		// 分享文本
		shareText(text) {
			uni.share({
				provider: 'weixin',
				scene: 'WXSceneSession',
				type: 0,
				title: '转录结果分享',
				summary: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
				success: () => {
					uni.showToast({
						title: '分享成功',
						icon: 'success'
					})
				},
				fail: () => {
					// 如果分享失败，则复制到剪贴板
					this.copyText(text)
				}
			})
		},
		
		// 删除记录
		async deleteItem(index) {
			uni.showModal({
				title: '确认删除',
				content: '确定要删除这条转录记录吗？',
				success: async (res) => {
					if (res.confirm) {
						try {
							await deleteTranscriptionHistory(index)
							this.historyList.splice(index, 1)
							uni.showToast({
								title: '删除成功',
								icon: 'success'
							})
						} catch (error) {
							uni.showToast({
								title: '删除失败',
								icon: 'none'
							})
						}
					}
				}
			})
		},
		
		// 获取预览文本
		getPreviewText(text) {
			return text.length > 100 ? text.substring(0, 100) + '...' : text
		},
		
		// 格式化时间
		formatTime(timestamp) {
			const date = new Date(timestamp)
			const now = new Date()
			const diff = now - date
			
			if (diff < 60000) { // 1分钟内
				return '刚刚'
			} else if (diff < 3600000) { // 1小时内
				return Math.floor(diff / 60000) + '分钟前'
			} else if (diff < 86400000) { // 1天内
				return Math.floor(diff / 3600000) + '小时前'
			} else if (diff < 604800000) { // 1周内
				return Math.floor(diff / 86400000) + '天前'
			} else {
				return date.toLocaleDateString('zh-CN', {
					year: 'numeric',
					month: '2-digit',
					day: '2-digit',
					hour: '2-digit',
					minute: '2-digit'
				})
			}
		},
		
		// 获取字数统计
		getWordCount(text) {
			return text.length
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

.search-section {
	margin-bottom: 30rpx;
}

.search-box {
	display: flex;
	align-items: center;
	background-color: #ffffff;
	border-radius: 50rpx;
	padding: 20rpx 30rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.search-icon {
	width: 32rpx;
	height: 32rpx;
	margin-right: 20rpx;
}

.search-input {
	flex: 1;
	font-size: 28rpx;
	color: #333333;
	border: none;
	outline: none;
}

.clear-btn {
	width: 40rpx;
	height: 40rpx;
	background-color: #cccccc;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 24rpx;
	color: #ffffff;
}

.history-list {
	padding-bottom: 100rpx;
}

.history-item {
	background-color: #ffffff;
	border-radius: 20rpx;
	padding: 30rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.item-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
}

.file-info {
	display: flex;
	align-items: center;
	flex: 1;
}

.file-icon {
	width: 40rpx;
	height: 40rpx;
	margin-right: 15rpx;
}

.file-name {
	font-size: 28rpx;
	color: #333333;
	font-weight: 500;
	max-width: 300rpx;
	text-overflow: ellipsis;
	white-space: nowrap;
	overflow: hidden;
}

.item-actions {
	display: flex;
	gap: 15rpx;
}

.copy-btn, .delete-btn {
	padding: 8rpx 20rpx;
	border-radius: 15rpx;
	font-size: 22rpx;
	border: none;
}

.copy-btn {
	background-color: #007AFF;
	color: #ffffff;
}

.delete-btn {
	background-color: #FF3B30;
	color: #ffffff;
}

.item-content {
	margin-bottom: 20rpx;
}

.result-preview {
	font-size: 26rpx;
	color: #666666;
	line-height: 1.5;
	word-wrap: break-word;
}

.item-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.timestamp {
	font-size: 22rpx;
	color: #999999;
}

.word-count {
	font-size: 22rpx;
	color: #999999;
}

.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 100rpx 40rpx;
}

.empty-icon {
	width: 200rpx;
	height: 200rpx;
	margin-bottom: 40rpx;
	opacity: 0.5;
}

.empty-text {
	font-size: 32rpx;
	color: #666666;
	margin-bottom: 20rpx;
}

.empty-tip {
	font-size: 24rpx;
	color: #999999;
}

.detail-modal {
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
	padding: 40rpx;
}

.detail-content {
	background-color: #ffffff;
	border-radius: 20rpx;
	max-height: 80vh;
	width: 100%;
	max-width: 600rpx;
	display: flex;
	flex-direction: column;
}

.detail-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx;
	border-bottom: 1rpx solid #f0f0f0;
}

.detail-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333333;
}

.close-btn {
	width: 60rpx;
	height: 60rpx;
	background-color: #f0f0f0;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 32rpx;
	color: #666666;
	border: none;
}

.detail-info {
	padding: 30rpx;
	border-bottom: 1rpx solid #f0f0f0;
}

.info-row {
	display: flex;
	margin-bottom: 15rpx;
}

.info-label {
	font-size: 26rpx;
	color: #666666;
	width: 150rpx;
}

.info-value {
	font-size: 26rpx;
	color: #333333;
	flex: 1;
}

.detail-result {
	padding: 30rpx;
	flex: 1;
	overflow-y: auto;
}

.result-title {
	font-size: 28rpx;
	font-weight: 500;
	color: #333333;
	margin-bottom: 20rpx;
}

.result-text-container {
	background-color: #f8f8f8;
	border-radius: 15rpx;
	padding: 30rpx;
	max-height: 400rpx;
	overflow-y: auto;
}

.result-text {
	font-size: 26rpx;
	line-height: 1.6;
	color: #333333;
	word-wrap: break-word;
}

.detail-actions {
	display: flex;
	gap: 20rpx;
	padding: 30rpx;
	border-top: 1rpx solid #f0f0f0;
}

.action-btn {
	flex: 1;
	height: 80rpx;
	border-radius: 40rpx;
	font-size: 28rpx;
	border: none;
}

.action-btn.copy-btn {
	background-color: #007AFF;
	color: #ffffff;
}

.action-btn.share-btn {
	background-color: #34C759;
	color: #ffffff;
}
</style>