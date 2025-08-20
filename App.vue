<script>
import { getApiKey, hasApiKey } from '@/utils/api.js'

export default {
	onLaunch: function() {
		console.log('App Launch')
		// API密钥已内置，无需检查配置
	},
	onShow: function() {
		console.log('App Show')
	},
	onHide: function() {
		console.log('App Hide')
	}
}
</script>

<style>
/* 全局样式重置 */
* {
	box-sizing: border-box;
}

page {
	background-color: #f5f5f5;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
	line-height: 1.6;
	color: #333333;
}

/* 通用按钮样式 */
.btn {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: 20rpx 40rpx;
	border-radius: 12rpx;
	font-size: 28rpx;
	border: none;
	outline: none;
	transition: all 0.3s ease;
	cursor: pointer;
}

.btn-primary {
	background-color: #007AFF;
	color: #ffffff;
}

.btn-primary:hover {
	background-color: #0056CC;
}

.btn-primary:disabled {
	background-color: #cccccc;
	color: #999999;
	cursor: not-allowed;
}

.btn-secondary {
	background-color: #f0f0f0;
	color: #333333;
}

.btn-secondary:hover {
	background-color: #e0e0e0;
}

.btn-danger {
	background-color: #FF3B30;
	color: #ffffff;
}

.btn-danger:hover {
	background-color: #D70015;
}

.btn-success {
	background-color: #34C759;
	color: #ffffff;
}

.btn-success:hover {
	background-color: #28A745;
}

/* 卡片样式 */
.card {
	background-color: #ffffff;
	border-radius: 20rpx;
	padding: 40rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	border: 1rpx solid #f0f0f0;
}

.card-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 30rpx;
	padding-bottom: 20rpx;
	border-bottom: 1rpx solid #f0f0f0;
}

.card-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #333333;
}

.card-content {
	line-height: 1.6;
}

/* 输入框样式 */
.input {
	width: 100%;
	padding: 24rpx 30rpx;
	border: 2rpx solid #e0e0e0;
	border-radius: 12rpx;
	font-size: 28rpx;
	color: #333333;
	background-color: #ffffff;
	transition: border-color 0.3s ease;
}

.input:focus {
	border-color: #007AFF;
	outline: none;
}

.input::placeholder {
	color: #999999;
}

/* 文本样式 */
.text-primary {
	color: #007AFF;
}

.text-secondary {
	color: #666666;
}

.text-muted {
	color: #999999;
}

.text-danger {
	color: #FF3B30;
}

.text-success {
	color: #34C759;
}

.text-warning {
	color: #FF9500;
}

/* 字体大小 */
.text-xs {
	font-size: 20rpx;
}

.text-sm {
	font-size: 24rpx;
}

.text-base {
	font-size: 28rpx;
}

.text-lg {
	font-size: 32rpx;
}

.text-xl {
	font-size: 36rpx;
}

.text-2xl {
	font-size: 40rpx;
}

/* 字体粗细 */
.font-normal {
	font-weight: 400;
}

.font-medium {
	font-weight: 500;
}

.font-semibold {
	font-weight: 600;
}

.font-bold {
	font-weight: 700;
}

/* 间距 */
.m-0 { margin: 0; }
.m-1 { margin: 10rpx; }
.m-2 { margin: 20rpx; }
.m-3 { margin: 30rpx; }
.m-4 { margin: 40rpx; }

.mt-0 { margin-top: 0; }
.mt-1 { margin-top: 10rpx; }
.mt-2 { margin-top: 20rpx; }
.mt-3 { margin-top: 30rpx; }
.mt-4 { margin-top: 40rpx; }

.mb-0 { margin-bottom: 0; }
.mb-1 { margin-bottom: 10rpx; }
.mb-2 { margin-bottom: 20rpx; }
.mb-3 { margin-bottom: 30rpx; }
.mb-4 { margin-bottom: 40rpx; }

.p-0 { padding: 0; }
.p-1 { padding: 10rpx; }
.p-2 { padding: 20rpx; }
.p-3 { padding: 30rpx; }
.p-4 { padding: 40rpx; }

/* 布局 */
.flex {
	display: flex;
}

.flex-col {
	flex-direction: column;
}

.flex-row {
	flex-direction: row;
}

.items-center {
	align-items: center;
}

.items-start {
	align-items: flex-start;
}

.items-end {
	align-items: flex-end;
}

.justify-center {
	justify-content: center;
}

.justify-between {
	justify-content: space-between;
}

.justify-around {
	justify-content: space-around;
}

.flex-1 {
	flex: 1;
}

/* 文本对齐 */
.text-left {
	text-align: left;
}

.text-center {
	text-align: center;
}

.text-right {
	text-align: right;
}

/* 圆角 */
.rounded {
	border-radius: 8rpx;
}

.rounded-lg {
	border-radius: 12rpx;
}

.rounded-xl {
	border-radius: 20rpx;
}

.rounded-full {
	border-radius: 50%;
}

/* 阴影 */
.shadow-sm {
	box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
}

.shadow {
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.shadow-lg {
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.15);
}

/* 动画 */
.fade-in {
	animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
	from {
		opacity: 0;
		transform: translateY(20rpx);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.slide-up {
	animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
	from {
		transform: translateY(100%);
	}
	to {
		transform: translateY(0);
	}
}

/* 加载动画 */
.loading-spinner {
	width: 40rpx;
	height: 40rpx;
	border: 3rpx solid #f3f3f3;
	border-top: 3rpx solid #007AFF;
	border-radius: 50%;
	animation: spin 1s linear infinite;
}

@keyframes spin {
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
}

/* 响应式设计 */
@media screen and (max-width: 750rpx) {
	.container {
		padding: 20rpx;
	}
	
	.card {
		padding: 30rpx;
	}
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
	page {
		background-color: #1a1a1a;
		color: #ffffff;
	}
	
	.card {
		background-color: #2a2a2a;
		border-color: #3a3a3a;
	}
	
	.input {
		background-color: #2a2a2a;
		border-color: #3a3a3a;
		color: #ffffff;
	}
	
	.input::placeholder {
		color: #666666;
	}
}

/* 安全区域适配 */
.safe-area-inset-top {
	padding-top: constant(safe-area-inset-top);
	padding-top: env(safe-area-inset-top);
}

.safe-area-inset-bottom {
	padding-bottom: constant(safe-area-inset-bottom);
	padding-bottom: env(safe-area-inset-bottom);
}
</style>
