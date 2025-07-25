```mermaid
sequenceDiagram
    participant Main as Main Process
    participant SF as ServerFacade
    participant App as Express App
    participant DB as PostgreSQL Database
    participant Client as Client Request
    participant Routes as Route Handlers

    Note over Main, Routes: Server Initialization Phase
    Main->>SF: new ServerFacade()
    SF->>SF: Initialize express app
    SF->>SF: Set port from appConfig
    
    Main->>SF: server.start()
    SF->>SF: configureMiddlewares()
    SF->>App: app.use(cors())
    SF->>App: Configure conditional JSON parsing
    Note over SF, App: Skip JSON for /api/line/webhook<br/>Apply JSON for other routes
    SF->>App: app.use(express.urlencoded())
    
    SF->>SF: configureRoutes()
    SF->>App: GET /api/health
    SF->>App: app.use('/api/line', lineWebhookRoute)
    SF->>App: app.use('/api/tickets', ticketRoutes)
    SF->>App: app.use('/api/admin-user', adminRoutes)
    
    SF->>SF: connectToDatabase()
    SF->>DB: SELECT NOW()
    DB-->>SF: Connection result
    SF->>SF: Log connection status
    
    SF->>SF: startServer()
    SF->>App: app.listen(port)
    App-->>SF: Server started
    SF->>SF: Log server running message

    Note over Main, Routes: Request Handling Phase
    Client->>App: HTTP Request
    
    alt Health Check Request
        App->>App: GET /api/health
        App-->>Client: {status: 'UP', message: 'Backend is running!'}
    
    else LINE Webhook Request
        App->>App: Check path contains '/api/line/webhook'
        App->>Routes: Forward to lineWebhookRoute (raw body)
        Routes-->>App: Response
        App-->>Client: LINE Webhook Response
    
    else Other API Requests
        App->>App: Apply JSON parsing middleware
        alt Ticket Routes
            App->>Routes: Forward to ticketRoutes
        else Admin Routes
            App->>Routes: Forward to adminRoutes
        end
        Routes->>DB: Database operations (if needed)
        DB-->>Routes: Query results
        Routes-->>App: Response
        App-->>Client: JSON Response
    end