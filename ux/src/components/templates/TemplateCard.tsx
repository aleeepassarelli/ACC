import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PromptTemplate } from '@/types/prompt.types';

interface TemplateCardProps {
  template: PromptTemplate;
  onClick: () => void;
}

export const TemplateCard = ({ template, onClick }: TemplateCardProps) => {
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all hover-scale"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{template.icon}</div>
            <div>
              <CardTitle className="text-lg">{template.name}</CardTitle>
              <CardDescription className="text-xs mt-1">
                {template.category}
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            SD {template.sdScore.toFixed(2)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {template.description}
        </p>
      </CardContent>
    </Card>
  );
};
