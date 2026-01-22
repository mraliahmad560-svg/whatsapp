// Main Application
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const authModal = document.getElementById('authModal');
    const mainContainer = document.getElementById('mainContainer');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const showRegisterLink = document.getElementById('showRegister');
    const showLoginLink = document.getElementById('showLogin');
    const closeBtn = document.querySelector('.close-btn');
    const logoutBtn = document.getElementById('logoutBtn');
    const currentUserSpan = document.getElementById('currentUser');
    const userRoleBadge = document.getElementById('userRoleBadge');
    const adminUploadSection = document.getElementById('adminUploadSection');
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadArea = document.getElementById('uploadArea');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const deleteAllBtn = document.getElementById('deleteAllBtn');
    const gallery3d = document.getElementById('gallery3d');
    const rotationSpeedSlider = document.getElementById('rotationSpeed');
    const galleryZoomSlider = document.getElementById('galleryZoom');
    const pictureCountSlider = document.getElementById('pictureCount');
    const resetGalleryBtn = document.getElementById('resetGalleryBtn');
    const rotateLeftBtn = document.getElementById('rotateLeftBtn');
    const rotateRightBtn = document.getElementById('rotateRightBtn');
    const autoRotateBtn = document.getElementById('autoRotateBtn');
    const pictureCountDisplay = document.getElementById('pictureCountDisplay');
    const previewModal = document.getElementById('previewModal');
    const closePreviewBtn = document.querySelector('.close-preview');
    const previewImage = document.getElementById('previewImage');
    const previewTitle = document.getElementById('previewTitle');
    const uploaderName = document.getElementById('uploaderName');
    const previewDate = document.getElementById('previewDate');
    const downloadBtn = document.getElementById('downloadBtn');
    const deletePictureBtn = document.getElementById('deletePictureBtn');
    
    // App State
    let currentUser = null;
    let isAdmin = false;
    let pictures = [];
    let autoRotate = false;
    let rotationAngle = 0;
    let rotationInterval = null;
    let currentRotationSpeed = 3;
    let currentZoom = 100;
    let currentPictureCount = 6;
    let selectedPictureIndex = -1;
    
    // Demo pictures data
    const demoPictures = [
        { id: 1, url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb', title: 'Mountain Landscape', uploader: 'admin', date: '2023-06-15' },
        { id: 2, url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba', title: 'Northern Lights', uploader: 'admin', date: '2023-06-10' },
        { id: 3, url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b', title: 'Ocean Waves', uploader: 'admin', date: '2023-06-05' },
        { id: 4, url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e', title: 'Forest Path', uploader: 'user', date: '2023-05-28' },
        { id: 5, url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05', title: 'Misty Mountains', uploader: 'user', date: '2023-05-20' },
        { id: 6, url: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07', title: 'Colorful Birds', uploader: 'user', date: '2023-05-15' },
    ];
    
    // Initialize the app
    function initApp() {
        // Check if user is already logged in (from localStorage)
        const savedUser = localStorage.getItem('magicGalleryUser');
        if (savedUser) {
            const userData = JSON.parse(savedUser);
            loginUser(userData.username, userData.role);
        } else {
            // Show auth modal if not logged in
            authModal.style.display = 'flex';
        }
        
        // Load demo pictures
        pictures = [...demoPictures];
        renderGallery();
        
        // Setup event listeners
        setupEventListeners();
    }
    
    // Setup all event listeners
    function setupEventListeners() {
        // Auth modal
        showRegisterLink.addEventListener('click', function(e) {
            e.preventDefault();
            loginForm.classList.remove('active');
            registerForm.classList.add('active');
        });
        
        showLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            registerForm.classList.remove('active');
            loginForm.classList.add('active');
        });
        
        closeBtn.addEventListener('click', function() {
            // Don't allow closing modal if not logged in
            if (!currentUser) return;
            authModal.style.display = 'none';
        });
        
        // Login form
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;
            
            // Simple validation
            if (!username || !password) {
                showMessage('Please fill in all fields', 'error');
                return;
            }
            
            // Demo login logic
            if (username === 'admin' && password === 'admin123') {
                loginUser(username, 'admin');
            } else if (username === 'user' && password === 'user123') {
                loginUser(username, 'user');
            } else {
                // Check if user exists in localStorage
                const users = JSON.parse(localStorage.getItem('magicGalleryUsers') || '[]');
                const user = users.find(u => u.username === username && u.password === password);
                
                if (user) {
                    loginUser(username, user.role || 'user');
                } else {
                    showMessage('Invalid username or password', 'error');
                }
            }
        });
        
        // Register form
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('registerUsername').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('registerConfirmPassword').value;
            
            // Validation
            if (!username || !email || !password || !confirmPassword) {
                showMessage('Please fill in all fields', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                showMessage('Passwords do not match', 'error');
                return;
            }
            
            if (password.length < 6) {
                showMessage('Password must be at least 6 characters', 'error');
                return;
            }
            
            // Check if user already exists
            const users = JSON.parse(localStorage.getItem('magicGalleryUsers') || '[]');
            if (users.some(u => u.username === username)) {
                showMessage('Username already exists', 'error');
                return;
            }
            
            // Add new user
            const newUser = {
                username,
                email,
                password,
                role: 'user'
            };
            
            users.push(newUser);
            localStorage.setItem('magicGalleryUsers', JSON.stringify(users));
            
            // Auto login after registration
            loginUser(username, 'user');
            
            showMessage('Account created successfully!', 'success');
        });
        
        // Logout
        logoutBtn.addEventListener('click', function() {
            currentUser = null;
            isAdmin = false;
            localStorage.removeItem('magicGalleryUser');
            
            // Reset UI
            authModal.style.display = 'flex';
            mainContainer.style.display = 'none';
            
            // Show login form
            registerForm.classList.remove('active');
            loginForm.classList.add('active');
            
            // Clear forms
            loginForm.reset();
            registerForm.reset();
            
            showMessage('Logged out successfully', 'success');
        });
        
        // File upload
        uploadArea.addEventListener('click', function() {
            fileInput.click();
        });
        
        fileInput.addEventListener('change', function() {
            const files = fileInput.files;
            if (files.length > 0) {
                showMessage(`Selected ${files.length} file(s)`, 'info');
            }
        });
        
        uploadBtn.addEventListener('click', function() {
            if (!isAdmin) {
                showMessage('Only admins can upload pictures', 'error');
                return;
            }
            
            const files = fileInput.files;
            if (files.length === 0) {
                showMessage('Please select files to upload', 'error');
                return;
            }
            
            // Simulate upload process
            simulateUpload(files);
        });
        
        // Delete all pictures (admin only)
        deleteAllBtn.addEventListener('click', function() {
            if (!isAdmin) {
                showMessage('Only admins can delete pictures', 'error');
                return;
            }
            
            if (confirm('Are you sure you want to delete all pictures?')) {
                // Keep only demo pictures uploaded by admin
                pictures = pictures.filter(pic => pic.uploader === 'admin');
                renderGallery();
                showMessage('All user pictures deleted', 'success');
            }
        });
        
        // Gallery controls
        rotationSpeedSlider.addEventListener('input', function() {
            currentRotationSpeed = parseInt(this.value);
            if (autoRotate) {
                startAutoRotation();
            }
        });
        
        galleryZoomSlider.addEventListener('input', function() {
            currentZoom = parseInt(this.value);
            gallery3d.style.transform = `rotateX(-10deg) rotateY(${rotationAngle}deg) scale(${currentZoom/100})`;
        });
        
        pictureCountSlider.addEventListener('input', function() {
            currentPictureCount = parseInt(this.value);
            pictureCountDisplay.textContent = `${currentPictureCount} pictures`;
            renderGallery();
        });
        
        resetGalleryBtn.addEventListener('click', function() {
            rotationSpeedSlider.value = 3;
            galleryZoomSlider.value = 100;
            pictureCountSlider.value = 6;
            currentRotationSpeed = 3;
            currentZoom = 100;
            currentPictureCount = 6;
            rotationAngle = 0;
            
            if (autoRotate) {
                stopAutoRotation();
                autoRotate = false;
                autoRotateBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Auto Rotate';
            }
            
            gallery3d.style.transform = `rotateX(-10deg) rotateY(0deg) scale(1)`;
            pictureCountDisplay.textContent = `${currentPictureCount} pictures`;
            renderGallery();
            
            showMessage('Gallery reset to default', 'info');
        });
        
        // Rotation controls
        rotateLeftBtn.addEventListener('click', function() {
            rotationAngle -= 45;
            gallery3d.style.transform = `rotateX(-10deg) rotateY(${rotationAngle}deg) scale(${currentZoom/100})`;
        });
        
        rotateRightBtn.addEventListener('click', function() {
            rotationAngle += 45;
            gallery3d.style.transform = `rotateX(-10deg) rotateY(${rotationAngle}deg) scale(${currentZoom/100})`;
        });
        
        autoRotateBtn.addEventListener('click', function() {
            autoRotate = !autoRotate;
            if (autoRotate) {
                startAutoRotation();
                this.innerHTML = '<i class="fas fa-stop"></i> Stop Rotation';
                this.style.background = 'rgba(255, 71, 87, 0.2)';
                this.style.color = '#ff4757';
                this.style.borderColor = '#ff4757';
            } else {
                stopAutoRotation();
                this.innerHTML = '<i class="fas fa-sync-alt"></i> Auto Rotate';
                this.style.background = '';
                this.style.color = '';
                this.style.borderColor = '';
            }
        });
        
        // Preview modal
        closePreviewBtn.addEventListener('click', function() {
            previewModal.style.display = 'none';
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', function(e) {
            if (e.target === authModal) {
                // Don't allow closing auth modal if not logged in
                if (!currentUser) return;
                authModal.style.display = 'none';
            }
            if (e.target === previewModal) {
                previewModal.style.display = 'none';
            }
        });
        
        // Download picture
        downloadBtn.addEventListener('click', function() {
            if (selectedPictureIndex >= 0) {
                const picture = pictures[selectedPictureIndex];
                const link = document.createElement('a');
                link.href = picture.url;
                link.download = `magic-gallery-${picture.title.toLowerCase().replace(/\s+/g, '-')}.jpg`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                showMessage('Download started', 'success');
            }
        });
        
        // Delete picture (admin only)
        deletePictureBtn.addEventListener('click', function() {
            if (!isAdmin) {
                showMessage('Only admins can delete pictures', 'error');
                return;
            }
            
            if (selectedPictureIndex >= 0) {
                const picture = pictures[selectedPictureIndex];
                if (picture.uploader === 'admin' && picture.id <= 6) {
                    showMessage('Cannot delete demo pictures', 'error');
                    return;
                }
                
                if (confirm('Are you sure you want to delete this picture?')) {
                    pictures.splice(selectedPictureIndex, 1);
                    renderGallery();
                    previewModal.style.display = 'none';
                    showMessage('Picture deleted', 'success');
                }
            }
        });
        
        // 3D Gallery mouse interaction
        let isDragging = false;
        let previousMouseX = 0;
        
        gallery3d.addEventListener('mousedown', function(e) {
            isDragging = true;
            previousMouseX = e.clientX;
        });
        
        document.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            
            const deltaX = e.clientX - previousMouseX;
            rotationAngle += deltaX * 0.5;
            gallery3d.style.transform = `rotateX(-10deg) rotateY(${rotationAngle}deg) scale(${currentZoom/100})`;
            
            previousMouseX = e.clientX;
        });
        
        document.addEventListener('mouseup', function() {
            isDragging = false;
        });
        
        // Gallery mousewheel zoom
        gallery3d.addEventListener('wheel', function(e) {
            e.preventDefault();
            currentZoom += e.deltaY > 0 ? -10 : 10;
            currentZoom = Math.max(50, Math.min(200, currentZoom));
            galleryZoomSlider.value = currentZoom;
            gallery3d.style.transform = `rotateX(-10deg) rotateY(${rotationAngle}deg) scale(${currentZoom/100})`;
        });
    }
    
    // Login user function
    function loginUser(username, role) {
        currentUser = username;
        isAdmin = role === 'admin';
        
        // Save to localStorage
        localStorage.setItem('magicGalleryUser', JSON.stringify({
            username,
            role
        }));
        
        // Update UI
        currentUserSpan.textContent = username;
        userRoleBadge.textContent = role === 'admin' ? 'Admin' : 'User';
        userRoleBadge.style.background = role === 'admin' 
            ? 'linear-gradient(90deg, #6a11cb, #2575fc)' 
            : 'linear-gradient(90deg, #FF416C, #FF4B2B)';
        
        // Show/hide admin section
        adminUploadSection.style.display = isAdmin ? 'block' : 'none';
        deletePictureBtn.style.display = isAdmin ? 'flex' : 'none';
        
        // Hide auth modal, show main content
        authModal.style.display = 'none';
        mainContainer.style.display = 'flex';
        
        showMessage(`Welcome back, ${username}!`, 'success');
    }
    
    // Simulate file upload
    function simulateUpload(files) {
        let uploadedCount = 0;
        const totalFiles = Math.min(files.length, 10); // Limit to 10 files
        
        progressText.textContent = `Uploading 0/${totalFiles} files...`;
        progressFill.style.width = '0%';
        
        // Simulate progress
        const simulateProgress = () => {
            if (uploadedCount < totalFiles) {
                uploadedCount++;
                const progressPercent = (uploadedCount / totalFiles) * 100;
                progressFill.style.width = `${progressPercent}%`;
                progressText.textContent = `Uploading ${uploadedCount}/${totalFiles} files...`;
                
                // Simulate network delay
                setTimeout(simulateProgress, 300 + Math.random() * 500);
            } else {
                // Upload complete
                progressText.textContent = `Upload complete! Added ${totalFiles} pictures to gallery.`;
                
                // Add uploaded pictures to gallery
                for (let i = 0; i < totalFiles; i++) {
                    const file = files[i];
                    
                    // Create object URL for local files
                    const imageUrl = URL.createObjectURL(file);
                    
                    // Add to pictures array
                    const newPicture = {
                        id: pictures.length + 1,
                        url: imageUrl,
                        title: `Uploaded ${pictures.length + 1}`,
                        uploader: currentUser,
                        date: new Date().toISOString().split('T')[0]
                    };
                    
                    pictures.push(newPicture);
                }
                
                // Update gallery
                renderGallery();
                
                // Reset file input
                fileInput.value = '';
                
                // Reset progress after 3 seconds
                setTimeout(() => {
                    progressFill.style.width = '0%';
                    progressText.textContent = 'Ready to upload';
                }, 3000);
                
                showMessage(`Successfully uploaded ${totalFiles} picture(s)`, 'success');
            }
        };
        
        // Start upload simulation
        simulateProgress();
    }
    
    // Render 3D gallery
    function renderGallery() {
        // Clear gallery
        gallery3d.innerHTML = '';
        
        // Use only the number of pictures specified by the slider
        const picturesToShow = pictures.slice(0, currentPictureCount);
        
        // Calculate angle between pictures
        const angleIncrement = 360 / picturesToShow.length;
        
        // Create picture frames
        picturesToShow.forEach((picture, index) => {
            const frame = document.createElement('div');
            frame.className = 'picture-frame';
            frame.dataset.index = index;
            
            // Calculate position in 3D space
            const angle = angleIncrement * index;
            const radius = 300; // Distance from center
            
            const x = radius * Math.cos(angle * Math.PI / 180);
            const z = radius * Math.sin(angle * Math.PI / 180);
            
            frame.style.transform = `translate3d(-50%, -50%, 0) rotateY(${angle}deg) translateZ(${radius}px)`;
            
            // Add image
            const img = document.createElement('img');
            img.src = picture.url;
            img.alt = picture.title;
            
            // Add picture info overlay
            const info = document.createElement('div');
            info.className = 'picture-info';
            info.innerHTML = `
                <h4>${picture.title}</h4>
                <p>By: ${picture.uploader}</p>
                <p>${picture.date}</p>
            `;
            
            frame.appendChild(img);
            frame.appendChild(info);
            
            // Add click event to view picture
            frame.addEventListener('click', function() {
                selectedPictureIndex = parseInt(this.dataset.index);
                showPreview(picturesToShow[selectedPictureIndex]);
            });
            
            gallery3d.appendChild(frame);
        });
        
        // Update picture count display
        pictureCountDisplay.textContent = `${picturesToShow.length} pictures`;
    }
    
    // Show picture preview
    function showPreview(picture) {
        previewImage.src = picture.url;
        previewTitle.textContent = picture.title;
        uploaderName.textContent = picture.uploader;
        previewDate.textContent = `Date: ${picture.date}`;
        
        // Show/hide delete button based on user role and picture ownership
        if (isAdmin && picture.uploader !== 'admin') {
            deletePictureBtn.style.display = 'flex';
        } else {
            deletePictureBtn.style.display = 'none';
        }
        
        previewModal.style.display = 'flex';
    }
    
    // Start auto rotation
    function startAutoRotation() {
        stopAutoRotation(); // Clear any existing interval
        
        rotationInterval = setInterval(() => {
            rotationAngle += currentRotationSpeed * 0.5;
            gallery3d.style.transform = `rotateX(-10deg) rotateY(${rotationAngle}deg) scale(${currentZoom/100})`;
        }, 50);
    }
    
    // Stop auto rotation
    function stopAutoRotation() {
        if (rotationInterval) {
            clearInterval(rotationInterval);
            rotationInterval = null;
        }
    }
    
    // Show message to user
    function showMessage(message, type) {
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.innerHTML = `
            <span>${message}</span>
            <button class="message-close">&times;</button>
        `;
        
        // Style the message
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 10px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: space-between;
            min-width: 300px;
            max-width: 400px;
            animation: slideIn 0.3s ease-out;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        `;
        
        // Set background based on type
        if (type === 'success') {
            messageEl.style.background = 'linear-gradient(90deg, #00b09b, #96c93d)';
        } else if (type === 'error') {
            messageEl.style.background = 'linear-gradient(90deg, #FF416C, #FF4B2B)';
        } else if (type === 'info') {
            messageEl.style.background = 'linear-gradient(90deg, #4A00E0, #8E2DE2)';
        }
        
        // Add close button event
        const closeBtn = messageEl.querySelector('.message-close');
        closeBtn.addEventListener('click', function() {
            messageEl.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 280);
        });
        
        // Add to page
        document.body.appendChild(messageEl);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.style.animation = 'slideOut 0.3s ease-out';
                setTimeout(() => {
                    if (messageEl.parentNode) {
                        messageEl.parentNode.removeChild(messageEl);
                    }
                }, 280);
            }
        }, 5000);
        
        // Add CSS for animations
        if (!document.querySelector('#message-styles')) {
            const style = document.createElement('style');
            style.id = 'message-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
                .message-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 24px;
                    cursor: pointer;
                    margin-left: 15px;
                    padding: 0;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Initialize the app
    initApp();
});