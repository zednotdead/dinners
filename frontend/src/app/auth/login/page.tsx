import {
  Card,
  // CardAction,
  CardContent,
  // CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@dinners/components/card';

export default function LoginPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Log in</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Card Content</p>
      </CardContent>
      <CardFooter>
        <p>Card Footer</p>
      </CardFooter>
    </Card>
  );
}
