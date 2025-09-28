import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageCircle, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatAnalysisProps {
  data: any[][];
  fileName: string;
}

export const ChatAnalysis = ({ data, fileName }: ChatAnalysisProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hi! I'm your data analysis assistant. I can help you analyze your Excel file "${fileName}". You can ask me questions like:

• "What's the summary of this data?"
• "Which column has the highest values?"
• "Show me trends in the data"
• "What insights can you find?"

What would you like to know about your data?`,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const analyzeData = (question: string): string => {
    if (!data || data.length < 2) {
      return "I need more data to provide analysis. Please upload a valid Excel file.";
    }

    const headers = data[0] || [];
    const rows = data.slice(1);
    const questionLower = question.toLowerCase();

    // Get numeric columns for analysis
    const numericColumns = headers.map((header, index) => {
      const values = rows.map(row => parseFloat(row[index])).filter(val => !isNaN(val));
      if (values.length > 0) {
        return {
          name: header,
          index,
          values,
          avg: values.reduce((a, b) => a + b, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          sum: values.reduce((a, b) => a + b, 0)
        };
      }
      return null;
    }).filter(col => col !== null);

    // Simple keyword-based analysis
    if (questionLower.includes('summary') || questionLower.includes('overview')) {
      return `📊 **Data Summary for ${fileName}:**

**Basic Info:**
• Total rows: ${rows.length.toLocaleString()}
• Total columns: ${headers.length}
• Numeric columns: ${numericColumns.length}

**Columns:** ${headers.join(', ')}

**Data Quality:**
• Data completeness: ${Math.round((rows.filter(row => row.some(cell => cell !== null && cell !== '')).length / rows.length) * 100)}%
• Non-empty rows: ${rows.filter(row => row.some(cell => cell !== null && cell !== '')).length.toLocaleString()}`;
    }

    if (questionLower.includes('highest') || questionLower.includes('maximum') || questionLower.includes('largest')) {
      if (numericColumns.length === 0) {
        return "I couldn't find any numeric columns to analyze for highest values.";
      }
      const highestCol = numericColumns.reduce((prev, current) => (prev.max > current.max) ? prev : current);
      return `🔝 **Highest Values:**

The column "${highestCol.name}" has the highest maximum value of **${highestCol.max.toLocaleString()}**.

**Top numeric columns by maximum value:**
${numericColumns.slice(0, 3).map(col => `• ${col.name}: ${col.max.toLocaleString()}`).join('\n')}`;
    }

    if (questionLower.includes('lowest') || questionLower.includes('minimum') || questionLower.includes('smallest')) {
      if (numericColumns.length === 0) {
        return "I couldn't find any numeric columns to analyze for lowest values.";
      }
      const lowestCol = numericColumns.reduce((prev, current) => (prev.min < current.min) ? prev : current);
      return `🔻 **Lowest Values:**

The column "${lowestCol.name}" has the lowest minimum value of **${lowestCol.min.toLocaleString()}**.

**Numeric columns by minimum value:**
${numericColumns.slice(0, 3).map(col => `• ${col.name}: ${col.min.toLocaleString()}`).join('\n')}`;
    }

    if (questionLower.includes('average') || questionLower.includes('mean')) {
      if (numericColumns.length === 0) {
        return "I couldn't find any numeric columns to calculate averages.";
      }
      return `📊 **Average Values:**

${numericColumns.slice(0, 5).map(col => 
        `• **${col.name}**: ${col.avg.toFixed(2)}`
      ).join('\n')}`;
    }

    if (questionLower.includes('trend') || questionLower.includes('pattern')) {
      if (numericColumns.length === 0) {
        return "I need numeric data to identify trends and patterns.";
      }
      
      return `📈 **Data Trends & Patterns:**

**Range Analysis:**
${numericColumns.slice(0, 3).map(col => {
        const range = col.max - col.min;
        const variability = range / col.avg;
        return `• **${col.name}**: Range ${range.toFixed(2)} (${variability > 1 ? 'High' : 'Low'} variability)`;
      }).join('\n')}

**Distribution Insights:**
• Most consistent data: ${numericColumns.reduce((prev, current) => 
        ((current.max - current.min) / current.avg) < ((prev.max - prev.min) / prev.avg) ? current : prev
      ).name}
• Most variable data: ${numericColumns.reduce((prev, current) => 
        ((current.max - current.min) / current.avg) > ((prev.max - prev.min) / prev.avg) ? current : prev
      ).name}`;
    }

    if (questionLower.includes('insight') || questionLower.includes('analysis') || questionLower.includes('findings')) {
      return `🔍 **Key Insights:**

**Data Structure:**
• Your dataset has ${rows.length.toLocaleString()} records across ${headers.length} fields
• ${numericColumns.length} columns contain quantitative data for analysis

**Notable Findings:**
${numericColumns.length > 0 ? `• Highest total value: ${numericColumns.reduce((prev, current) => (prev.sum > current.sum) ? prev : current).name} (${numericColumns.reduce((prev, current) => (prev.sum > current.sum) ? prev : current).sum.toLocaleString()})` : ''}
${numericColumns.length > 1 ? `• Most balanced range: ${numericColumns.reduce((prev, current) => ((current.max - current.min) / current.avg) < ((prev.max - prev.min) / prev.avg) ? current : prev).name}` : ''}

**Recommendations:**
• Consider visualizing the "${numericColumns[0]?.name}" column for trends
• Look for correlations between numeric fields
• Check for any outliers in the data ranges`;
    }

    if (questionLower.includes('column') || questionLower.includes('field')) {
      return `📋 **Column Information:**

**All Columns (${headers.length}):**
${headers.map((header, index) => {
        const isNumeric = numericColumns.some(col => col.index === index);
        return `${index + 1}. **${header}** ${isNumeric ? '(Numeric)' : '(Text)'}`;
      }).join('\n')}

**Numeric Columns for Analysis:**
${numericColumns.map(col => `• ${col.name}: ${col.values.length} values`).join('\n')}`;
    }

    // Default response for unmatched questions
    return `I can help analyze your data! Try asking about:

🔍 **Analysis Questions:**
• "What's the summary of this data?"
• "Which column has the highest/lowest values?"
• "Show me the averages"
• "What trends do you see?"
• "What insights can you find?"
• "Tell me about the columns"

Your data has ${rows.length.toLocaleString()} rows and ${headers.length} columns. What specific aspect would you like me to analyze?`;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simulate AI processing delay
    setTimeout(() => {
      const analysis = analyzeData(inputMessage);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: analysis,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="h-[600px] flex flex-col shadow-card">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center space-x-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <span>Chat Analysis</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div className={`
                  flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                  ${message.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-accent text-accent-foreground'
                  }
                `}>
                  {message.role === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                
                <div className={`
                  flex-1 p-3 rounded-lg max-w-[80%]
                  ${message.role === 'user'
                    ? 'bg-primary text-primary-foreground ml-auto'
                    : 'bg-muted'
                  }
                `}>
                  <div className="whitespace-pre-wrap text-sm">
                    {message.content}
                  </div>
                  <div className={`
                    text-xs mt-2 opacity-70
                    ${message.role === 'user' ? 'text-primary-foreground' : 'text-muted-foreground'}
                  `}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex-1 p-3 rounded-lg bg-muted max-w-[80%]">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="flex-shrink-0 p-4 border-t">
          <div className="flex space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about your data..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};