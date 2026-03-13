"use client";

import { useState, useRef, useEffect } from "react";

interface FileTransferProps {
	deviceName: string;
	ws: WebSocket | null;
	onClose: () => void;
	fileListData?: { files: any[]; path: string } | null;
}

interface FileItem {
	name: string;
	type: "file" | "directory";
	size?: number;
	path: string;
}

export function FileTransfer({
	deviceName,
	ws,
	onClose,
	fileListData,
}: FileTransferProps) {
	const [currentPath, setCurrentPath] = useState("Downloads");
	const [files, setFiles] = useState<FileItem[]>([]);
	const [uploading, setUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [uploadMessage, setUploadMessage] = useState("");
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Update files when fileListData changes
	useEffect(() => {
		if (fileListData) {
			setFiles(fileListData.files);
			setCurrentPath(fileListData.path);
			console.log(
				"FileTransfer: Updated file list",
				fileListData.files.length,
				"files",
			);
		}
	}, [fileListData]);

	// Browse Downloads folder on mount
	useEffect(() => {
		if (ws && ws.readyState === WebSocket.OPEN) {
			console.log("FileTransfer: Initial browse to Downloads folder");
			browseFiles("Downloads");
		}
	}, [ws, deviceName]);

	const browseFiles = (path: string) => {
		if (!ws || ws.readyState !== WebSocket.OPEN) return;

		ws.send(
			JSON.stringify({
				type: "BROWSE_FILES",
				deviceName,
				path,
			}),
		);
	};

	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file || !ws || ws.readyState !== WebSocket.OPEN) return;

		setUploading(true);
		setUploadProgress(0);

		const reader = new FileReader();
		reader.onload = () => {
			const base64 = (reader.result as string).split(",")[1];

			// Simulate upload progress
			let progress = 0;
			const progressInterval = setInterval(() => {
				progress += 10;
				setUploadProgress(Math.min(progress, 90));
			}, 100);

			ws.send(
				JSON.stringify({
					type: "UPLOAD_FILE",
					deviceName,
					fileName: file.name,
					fileData: base64,
					targetPath: currentPath || "Downloads",
				}),
			);

			// Wait for upload to complete, then refresh
			setTimeout(() => {
				clearInterval(progressInterval);
				setUploadProgress(100);

				// Show success message
				setUploadMessage(
					`✓ ${file.name} uploaded successfully to ${currentPath || "Downloads"}!`,
				);

				// Refresh the file list after upload
				setTimeout(() => {
					setUploading(false);
					setUploadProgress(0);

					// Refresh current directory
					const pathToRefresh = currentPath || "Downloads";
					console.log("Refreshing file list for path:", pathToRefresh);
					browseFiles(pathToRefresh);

					// Reset file input
					if (fileInputRef.current) {
						fileInputRef.current.value = "";
					}

					// Clear success message after 3 seconds
					setTimeout(() => {
						setUploadMessage("");
					}, 3000);
				}, 500);
			}, 1000);
		};

		reader.readAsDataURL(file);
	};

	const handleFileDownload = (file: FileItem) => {
		if (!ws || ws.readyState !== WebSocket.OPEN) return;

		ws.send(
			JSON.stringify({
				type: "DOWNLOAD_FILE",
				deviceName,
				filePath: file.path,
			}),
		);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		const file = e.dataTransfer.files[0];
		if (file && fileInputRef.current) {
			const dataTransfer = new DataTransfer();
			dataTransfer.items.add(file);
			fileInputRef.current.files = dataTransfer.files;
			handleFileUpload({ target: fileInputRef.current } as any);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
			<div className="glass rounded-2xl border border-white/10 w-full max-w-4xl max-h-[80vh] overflow-hidden shadow-2xl flex flex-col">
				{/* Header */}
				<div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
					<div className="flex items-center gap-3">
						<div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
							<svg
								className="w-5 h-5 text-blue-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
								/>
							</svg>
						</div>
						<div>
							<h3 className="text-lg font-semibold text-white">
								File Transfer
							</h3>
							<p className="text-xs text-white/50">{deviceName}</p>
						</div>
					</div>
					<button
						onClick={onClose}
						className="h-8 w-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition text-white/60 hover:text-white">
						<svg
							className="w-5 h-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>

				{/* Upload Area */}
				<div
					className="px-6 py-4 border-b border-white/10"
					onDrop={handleDrop}
					onDragOver={(e) => e.preventDefault()}>
					<div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-emerald-500/50 transition">
						<input
							ref={fileInputRef}
							type="file"
							onChange={handleFileUpload}
							className="hidden"
							id="file-upload"
						/>
						<label htmlFor="file-upload" className="cursor-pointer">
							<svg
								className="w-12 h-12 mx-auto mb-3 text-white/40"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
								/>
							</svg>
							<p className="text-sm text-white/80 mb-1">
								Click to upload or drag and drop
							</p>
							<p className="text-xs text-white/40">
								Files will be uploaded to: {currentPath || "Downloads"}
							</p>
						</label>
					</div>

					{uploading && (
						<div className="mt-4">
							<div className="flex items-center justify-between text-xs mb-2">
								<span className="text-white/60">Uploading...</span>
								<span className="text-white/90">{uploadProgress}%</span>
							</div>
							<div className="h-2 bg-white/5 rounded-full overflow-hidden">
								<div
									className="h-full bg-emerald-500 transition-all duration-300"
									style={{ width: `${uploadProgress}%` }}
								/>
							</div>
						</div>
					)}

					{uploadMessage && (
						<div className="mt-4 px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/50">
							<p className="text-sm text-emerald-400">{uploadMessage}</p>
						</div>
					)}
				</div>

				{/* File Browser */}
				<div className="flex-1 overflow-y-auto p-6">
					<div className="mb-4 flex items-center gap-2">
						<button
							onClick={() => browseFiles("Downloads")}
							className={`px-4 py-2 rounded-lg border text-sm transition ${
								currentPath.includes("Downloads")
									? "bg-blue-500/20 border-blue-500/50 text-blue-400"
									: "bg-white/5 hover:bg-white/10 border-white/10 text-white/80"
							}`}>
							Downloads
						</button>
						<button
							onClick={() => browseFiles("Desktop")}
							className={`px-4 py-2 rounded-lg border text-sm transition ${
								currentPath.includes("Desktop")
									? "bg-blue-500/20 border-blue-500/50 text-blue-400"
									: "bg-white/5 hover:bg-white/10 border-white/10 text-white/80"
							}`}>
							Desktop
						</button>
						<button
							onClick={() => browseFiles("Documents")}
							className={`px-4 py-2 rounded-lg border text-sm transition ${
								currentPath.includes("Documents")
									? "bg-blue-500/20 border-blue-500/50 text-blue-400"
									: "bg-white/5 hover:bg-white/10 border-white/10 text-white/80"
							}`}>
							Documents
						</button>
					</div>

					{currentPath && (
						<div className="mb-4 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
							<p className="text-xs text-white/60">Current Path:</p>
							<p className="text-sm text-white/90 font-mono">{currentPath}</p>
						</div>
					)}

					<div className="space-y-2">
						{files.length === 0 ? (
							<div className="text-center py-12">
								<svg
									className="w-16 h-16 mx-auto mb-4 text-white/20"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
									/>
								</svg>
								<p className="text-sm text-white/40">
									Click a folder above to browse files
								</p>
							</div>
						) : (
							files.map((file, idx) => (
								<div
									key={idx}
									className="flex items-center justify-between px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition group">
									<div className="flex items-center gap-3">
										{file.type === "directory" ? (
											<svg
												className="w-5 h-5 text-blue-400"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24">
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
												/>
											</svg>
										) : (
											<svg
												className="w-5 h-5 text-white/60"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24">
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
												/>
											</svg>
										)}
										<div>
											<p className="text-sm text-white/90">{file.name}</p>
											{file.size && (
												<p className="text-xs text-white/40">
													{(file.size / 1024).toFixed(2)} KB
												</p>
											)}
										</div>
									</div>
									{file.type === "file" && (
										<button
											onClick={() => handleFileDownload(file)}
											className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-xs text-emerald-400 transition opacity-100 md:opacity-0 md:group-hover:opacity-100">
											Download
										</button>
									)}
									{file.type === "directory" && (
										<button
											onClick={() => browseFiles(file.path)}
											className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-xs text-blue-400 transition opacity-100 md:opacity-0 md:group-hover:opacity-100">
											Open
										</button>
									)}
								</div>
							))
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
