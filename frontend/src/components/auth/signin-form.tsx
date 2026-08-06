import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "../ui/label";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/store/useAuthStore";
import { useNavigate } from "react-router-dom";

const signInSchema = z.object({
  username: z.string().min(3, "Ten dang nhap phai it nhat 3 ky tu"),
  password: z.string().min(6, "Mat khau phai it nhat 6 ky tu"),
});

type SignInFormValues = z.infer<typeof signInSchema>;
export function SigninForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { signIn } = useAuthStore();
  const navigate = useNavigate();
  //useForm la hook giup lay du lieu input, kiem tra input co hop le, gui form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema), // ket noi useForm voi schema
  });

  const onSubmit = async (data: SignInFormValues) => {
    const { username, password } = data;
    await signIn(username, password);
    navigate("/");
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 border-border">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              {/* header - logo */}
              <div className="flex flex-col items-center text-center gap-2">
                <a href="/" className="mx-auto block w-fit text-center">
                  <img src="/logo.svg" alt="logo" />
                </a>
                <h1 className="text-2xl font-bold">Chao mung quay lai</h1>
                <p className="text-muted-foreground text-balance">
                  Dang nhap vao tai khoan cua ban
                </p>
              </div>
              {/* username */}
              <div className="flex flex-col gap-3 ">
                <Label htmlFor="username" className="block text-sm">
                  ten dang nhap
                </Label>
                <Input
                  type="text"
                  id="username"
                  placeholder="username"
                  {...register("username")}
                />
                {errors.username && (
                  <p className="text-destructive text-sm">
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* pwd */}
              <div className="flex flex-col gap-3 ">
                <Label htmlFor="password" className="block text-sm">
                  mat khau
                </Label>
                <Input
                  type="password"
                  id="password"
                  placeholder="password"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-destructive text-sm">
                    {errors.password.message}
                  </p>
                )}
              </div>
              {/* btn signup */}
              <Button
                type="submit"
                className="w-full cursor-pointer"
                disabled={isSubmitting}
              >
                Dang nhap
              </Button>
              <div className="text-center text-sm">
                chua co tai khoan?{" "}
                <a href="/signup" className="underline underline-offset-4">
                  Dang ky
                </a>
              </div>
            </div>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="/placeholder.png"
              alt="Image"
              className="absolute top-1/2 -translate-y-1/2 object-cover "
            />
          </div>
        </CardContent>
      </Card>
      <div className="px-6 text-xs text-balance text-center text-muted-foreground *:[a]:hover:text-primary  *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
