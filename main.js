// Printing Production Management System - Core JavaScript
class PrintProductionSystem {
    constructor() {
        this.currentUser = null;
        this.db = null;
        this.init();
    }

    init() {
        this.initDatabase();
        this.checkAuthentication();
        this.setupEventListeners();
        this.initNotifications();
    }

    // Database Initialization
    initDatabase() {
        const savedData = localStorage.getItem('printProductionDB');
        if (savedData) {
            this.db = JSON.parse(savedData);
        } else {
            // Load initial schema
            this.loadInitialData();
        }
    }

    loadInitialData() {
        // This would normally load from database_schema.json
        // For demo purposes, we'll create minimal required structure
        this.db = {
            users: [
                {
                    id: 'admin_001',
                    username: 'admin',
                    email: 'admin@printcompany.com',
                    password: 'admin123', // In production, this should be hashed
                    role: 'administrator',
                    position: 'System Administrator',
                    fullName: 'System Administrator',
                    photo: 'resources/icons/admin-avatar.png',
                    isActive: true,
                    createdAt: new Date().toISOString(),
                    lastLogin: null,
                    loginAttempts: 0,
                    isLocked: false,
                    theme: 'light',
                    permissions: ['all']
                }
            ],
            clients: [],
            orders: [],
            calculators: [
                {
                    id: 'dtf_calculator',
                    name: 'DTF Печать',
                    technology: 'DTF',
                    isActive: true,
                    pricing: {
                        formats: {
                            'A1': { width: 59.4, height: 84.1, maxSheets: 0 },
                            'A2': { width: 42.0, height: 59.4, maxSheets: 1 },
                            'A3': { width: 29.7, height: 42.0, maxSheets: 3 },
                            'A4': { width: 21.0, height: 29.7, maxSheets: 6 },
                            'A5': { width: 14.8, height: 21.0, maxSheets: 12 },
                            'A6': { width: 10.5, height: 14.8, maxSheets: 30 },
                            'A7': { width: 7.4, height: 10.5, maxSheets: 65 }
                        },
                        meterPricing: [
                            { range: '1-5', price: 1100, time: '1д' },
                            { range: '5-10', price: 1000, time: '1д' },
                            { range: '10-30', price: 900, time: '1д' },
                            { range: '30-50', price: 850, time: '1д' },
                            { range: '50-100', price: 800, time: '2д' },
                            { range: '100-1000', price: 750, time: 'от 2 до 9д' }
                        ],
                        transferPricing: [
                            { range: '10', price: 100, time: '1д' },
                            { range: '50', price: 55, time: '1д' },
                            { range: '100', price: 50, time: '1д' },
                            { range: '500', price: 45, time: '2д' },
                            { range: '1000', price: 40, time: '3-4д' },
                            { range: '1000-10000', price: 35, time: 'обговаривается' }
                        ],
                        packagingPricing: [
                            { range: '10', packagePrice: 30, barcodePrice: 4, bagPrice: 8 },
                            { range: '50', packagePrice: 25, barcodePrice: 4, bagPrice: 8 },
                            { range: '100', packagePrice: 23, barcodePrice: 4, bagPrice: 8 },
                            { range: '500', packagePrice: 20, barcodePrice: 4, bagPrice: 8 },
                            { range: '1000', packagePrice: 20, barcodePrice: 3, bagPrice: 7 },
                            { range: '1000-10000', packagePrice: 19, barcodePrice: 3, bagPrice: 7 }
                        ]
                    }
                }
            ],
            products: [],
            chatMessages: [],
            documents: [],
            systemLogs: [],
            notifications: [],
            productions: []
        };
        this.saveDatabase();
    }

    saveDatabase() {
        localStorage.setItem('printProductionDB', JSON.stringify(this.db));
    }

    // Authentication System
    checkAuthentication() {
        const session = localStorage.getItem('currentSession');
        if (session) {
            const sessionData = JSON.parse(session);
            const user = this.db.users.find(u => u.id === sessionData.userId);
            if (user && !user.isLocked) {
                this.currentUser = user;
                this.updateUI();
                return true;
            }
        }
        return false;
    }

    login(username, password) {
        const user = this.db.users.find(u => u.username === username);
        
        if (!user) {
            return { success: false, message: 'Пользователь не найден' };
        }

        if (user.isLocked) {
            return { success: false, message: 'Аккаунт заблокирован. Обратитесь к администратору.' };
        }

        if (user.password !== password) {
            user.loginAttempts++;
            if (user.loginAttempts >= 5) {
                user.isLocked = true;
                this.logAction('account_locked', `Аккаунт заблокирован после 5 неудачных попыток: ${username}`);
                return { success: false, message: 'Аккаунт заблокирован после 5 неудачных попыток. Обратитесь к администратору.' };
            }
            this.saveDatabase();
            return { success: false, message: `Неверный пароль. Осталось попыток: ${5 - user.loginAttempts}` };
        }

        // Successful login
        user.loginAttempts = 0;
        user.lastLogin = new Date().toISOString();
        this.currentUser = user;
        
        // Create session
        const session = {
            userId: user.id,
            loginTime: new Date().toISOString(),
            token: this.generateToken()
        };
        localStorage.setItem('currentSession', JSON.stringify(session));
        
        this.logAction('login', `Успешный вход пользователя: ${username}`);
        this.saveDatabase();
        
        return { success: true, message: 'Вход выполнен успешно' };
    }

    logout() {
        if (this.currentUser) {
            this.logAction('logout', `Выход из системы: ${this.currentUser.username}`);
        }
        localStorage.removeItem('currentSession');
        this.currentUser = null;
        window.location.href = 'login.html';
    }

    register(userData) {
        const existingUser = this.db.users.find(u => u.username === userData.username || u.email === userData.email);
        if (existingUser) {
            return { success: false, message: 'Пользователь с таким именем или email уже существует' };
        }

        const newUser = {
            id: 'user_' + Date.now(),
            username: userData.username,
            email: userData.email,
            password: userData.password,
            role: 'manager',
            position: userData.position || 'Менеджер',
            fullName: userData.fullName,
            photo: 'resources/icons/default-avatar.png',
            isActive: false, // Requires admin approval
            createdAt: new Date().toISOString(),
            lastLogin: null,
            loginAttempts: 0,
            isLocked: false,
            theme: 'light',
            permissions: ['view_orders', 'manage_clients', 'use_calculator']
        };

        this.db.users.push(newUser);
        this.saveDatabase();
        
        this.logAction('registration', `Регистрация нового пользователя: ${userData.username}`);
        
        return { success: true, message: 'Регистрация успешна. Ожидайте подтверждения администратора.' };
    }

    generateToken() {
        return Math.random().toString(36).substr(2) + Date.now().toString(36);
    }

    // DTF Calculator
    calculateDTF(format, width, height, quantity, complexity, sides) {
        const calculator = this.db.calculators.find(c => c.id === 'dtf_calculator');
        if (!calculator) return null;

        const formatData = calculator.pricing.formats[format];
        if (!formatData) return null;

        // Calculate total print area in square meters
        const itemArea = (width * height) / 10000; // Convert cm² to m²
        const totalArea = itemArea * quantity;

        // Calculate sheets needed
        const sheetsNeeded = Math.ceil(quantity / formatData.maxSheets);

        // Find pricing tier
        let meterPrice = calculator.pricing.meterPricing[0].price;
        for (const tier of calculator.pricing.meterPricing) {
            const [min, max] = tier.range.split('-').map(Number);
            if (totalArea >= min && (max === undefined || totalArea <= max)) {
                meterPrice = tier.price;
                break;
            }
        }

        // Calculate print cost
        const printCost = totalArea * meterPrice;

        // Calculate transfer cost
        let transferPrice = calculator.pricing.transferPricing[0].price;
        for (const tier of calculator.pricing.transferPricing) {
            if (quantity >= Number(tier.range)) {
                transferPrice = tier.price;
            }
        }
        const transferCost = quantity * transferPrice;

        // Complexity multiplier
        const complexityMultiplier = complexity === 'difficult' ? 1.5 : 1;

        // Sides multiplier
        const sidesMultiplier = sides === 'double' ? 1.8 : 1;

        // Calculate total cost
        const totalCost = (printCost + transferCost) * complexityMultiplier * sidesMultiplier;

        return {
            totalArea,
            sheetsNeeded,
            printCost,
            transferCost,
            complexityMultiplier,
            sidesMultiplier,
            totalCost,
            unitPrice: totalCost / quantity,
            format: formatData
        };
    }

    // Document Generation
    generateDocument(type, orderId) {
        const order = this.db.orders.find(o => o.id === orderId);
        if (!order) return null;

        const client = this.db.clients.find(c => c.id === order.clientId);
        const document = {
            id: 'doc_' + Date.now(),
            type: type,
            orderId: orderId,
            clientId: order.clientId,
            generatedBy: this.currentUser.id,
            fileName: `${type}_${orderId}_${client.companyName}.pdf`,
            filePath: `resources/documents/${type}_${orderId}_${client.companyName}.pdf`,
            createdAt: new Date().toISOString(),
            status: 'generated'
        };

        this.db.documents.push(document);
        this.saveDatabase();
        
        return document;
    }

    // Chat System
    sendMessage(orderId, message, files = []) {
        const chatMessage = {
            id: 'msg_' + Date.now(),
            orderId: orderId,
            from: this.currentUser.id,
            to: null, // Can be specific user or null for broadcast
            message: message,
            timestamp: new Date().toISOString(),
            isSystem: false,
            files: files
        };

        this.db.chatMessages.push(chatMessage);
        this.saveDatabase();
        
        // Send notification
        this.createNotification('new_message', 'Новое сообщение в чате', message);
        
        return chatMessage;
    }

    // Notification System
    createNotification(type, title, message, userId = null) {
        const notification = {
            id: 'notif_' + Date.now(),
            userId: userId || this.currentUser.id,
            type: type,
            title: title,
            message: message,
            isRead: false,
            createdAt: new Date().toISOString()
        };

        this.db.notifications.push(notification);
        this.saveDatabase();
        
        // Show browser notification if permission granted
        if (Notification.permission === 'granted') {
            new Notification(title, {
                body: message,
                icon: 'resources/icons/notification.png'
            });
        }
        
        return notification;
    }

    // Logging System
    logAction(action, details, userId = null) {
        const log = {
            id: 'log_' + Date.now(),
            userId: userId || (this.currentUser ? this.currentUser.id : null),
            action: action,
            details: details,
            timestamp: new Date().toISOString(),
            ipAddress: '127.0.0.1' // In real app, get from request
        };

        this.db.systemLogs.push(log);
        this.saveDatabase();
    }

    // Client Management
    createClient(clientData) {
        const client = {
            id: 'client_' + Date.now(),
            companyName: clientData.companyName,
            contactPerson: clientData.contactPerson,
            email: clientData.email,
            phone: clientData.phone,
            status: 'new',
            assignedTo: this.currentUser.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            history: []
        };

        this.db.clients.push(client);
        this.saveDatabase();
        
        this.logAction('client_created', `Создан новый клиент: ${clientData.companyName}`);
        this.createNotification('new_client', 'Новый клиент', `Создан клиент: ${clientData.companyName}`);
        
        return client;
    }

    // Order Management
    createOrder(orderData) {
        const order = {
            id: 'order_' + Date.now(),
            clientId: orderData.clientId,
            title: orderData.title,
            status: 'processing',
            priority: orderData.priority || 'medium',
            assignedTo: this.currentUser.id,
            calculatorData: orderData.calculatorData || {},
            files: [],
            comments: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deadline: orderData.deadline
        };

        this.db.orders.push(order);
        this.saveDatabase();
        
        this.logAction('order_created', `Создан новый заказ: ${orderData.title}`);
        this.createNotification('new_order', 'Новый заказ', `Создан заказ: ${orderData.title}`);
        
        return order;
    }

    // UI Updates
    updateUI() {
        if (!this.currentUser) return;

        // Update user info in header
        const userNameElement = document.getElementById('userName');
        const userRoleElement = document.getElementById('userRole');
        
        if (userNameElement) userNameElement.textContent = this.currentUser.fullName;
        if (userRoleElement) userRoleElement.textContent = this.currentUser.position;

        // Update notifications
        this.updateNotifications();
    }

    updateNotifications() {
        const unreadNotifications = this.db.notifications.filter(n => 
            n.userId === this.currentUser.id && !n.isRead
        );
        
        const notificationBadge = document.getElementById('notificationBadge');
        if (notificationBadge) {
            notificationBadge.textContent = unreadNotifications.length;
            notificationBadge.style.display = unreadNotifications.length > 0 ? 'block' : 'none';
        }
    }

    // Event Listeners
    setupEventListeners() {
        // Burger menu toggle
        const burgerMenu = document.getElementById('burgerMenu');
        const sidebar = document.getElementById('sidebar');
        
        if (burgerMenu && sidebar) {
            burgerMenu.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });
        }

        // Notification click
        const notificationBtn = document.getElementById('notificationBtn');
        if (notificationBtn) {
            notificationBtn.addEventListener('click', () => {
                this.showNotifications();
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }
    }

    // Notification System Initialization
    initNotifications() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    showNotifications() {
        const notifications = this.db.notifications
            .filter(n => n.userId === this.currentUser.id)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 10);

        // Create notification dropdown
        const dropdown = document.createElement('div');
        dropdown.className = 'notification-dropdown';
        dropdown.innerHTML = `
            <div class="notification-header">
                <h3>Уведомления</h3>
                <button onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="notification-list">
                ${notifications.map(n => `
                    <div class="notification-item ${n.isRead ? 'read' : 'unread'}">
                        <strong>${n.title}</strong>
                        <p>${n.message}</p>
                        <small>${new Date(n.createdAt).toLocaleString()}</small>
                    </div>
                `).join('')}
            </div>
        `;

        document.body.appendChild(dropdown);

        // Mark notifications as read
        notifications.forEach(n => n.isRead = true);
        this.saveDatabase();
        this.updateNotifications();
    }

    // Utility Methods
    formatCurrency(amount) {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB'
        }).format(amount);
    }

    formatDate(date) {
        return new Date(date).toLocaleDateString('ru-RU');
    }

    generateId(prefix = '') {
        return prefix + Date.now() + Math.random().toString(36).substr(2, 9);
    }
}

// Initialize the system
const system = new PrintProductionSystem();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PrintProductionSystem;
}