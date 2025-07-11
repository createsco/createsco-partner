"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Copy, Globe, Code, CheckCircle } from "lucide-react"

export function CorsConfigHelper() {
  const [currentDomain, setCurrentDomain] = useState<string>("")
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentDomain(window.location.origin)
    }
  }, [])

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const expressConfig = `// Express.js CORS Configuration
const cors = require('cors');

const corsOptions = {
  origin: [
    'http://localhost:3000',
    '${currentDomain}',
    'https://v0.dev',
    'https://*.v0.dev'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept'
  ],
  credentials: false
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));`

  const nodeConfig = `// Node.js Manual CORS Headers
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:3000',
    '${currentDomain}',
    'https://v0.dev'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.setHeader('Access-Control-Allow-Credentials', 'false');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});`

  const nginxConfig = `# Nginx CORS Configuration
location /api/ {
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' '${currentDomain}';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS';
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Requested-With, Accept';
        add_header 'Access-Control-Max-Age' 1728000;
        add_header 'Content-Type' 'text/plain; charset=utf-8';
        add_header 'Content-Length' 0;
        return 204;
    }
    
    add_header 'Access-Control-Allow-Origin' '${currentDomain}';
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS';
    add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Requested-With, Accept';
    
    proxy_pass http://your-backend;
}`

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            CORS Configuration for Backend Team
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Frontend Domain:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{currentDomain}</code>
              <br />
              Add this domain to your backend CORS configuration to fix the connection issue.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4">
            {/* Express.js Configuration */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Express.js Configuration
                </h3>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(expressConfig, "express")}>
                  <Copy className="h-4 w-4 mr-1" />
                  {copied === "express" ? "Copied!" : "Copy"}
                </Button>
              </div>
              <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
                <code>{expressConfig}</code>
              </pre>
            </div>

            {/* Node.js Manual Configuration */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Node.js Manual Headers
                </h3>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(nodeConfig, "node")}>
                  <Copy className="h-4 w-4 mr-1" />
                  {copied === "node" ? "Copied!" : "Copy"}
                </Button>
              </div>
              <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
                <code>{nodeConfig}</code>
              </pre>
            </div>

            {/* Nginx Configuration */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Nginx Configuration
                </h3>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(nginxConfig, "nginx")}>
                  <Copy className="h-4 w-4 mr-1" />
                  {copied === "nginx" ? "Copied!" : "Copy"}
                </Button>
              </div>
              <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
                <code>{nginxConfig}</code>
              </pre>
            </div>
          </div>

          <Alert>
            <AlertDescription>
              <strong>Quick Fix:</strong> Add <code>{currentDomain}</code> to your existing CORS origins array, or use
              <code>origin: '*'</code> for development (not recommended for production).
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
