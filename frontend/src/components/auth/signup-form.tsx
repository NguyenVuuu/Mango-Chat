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

const signUpSchema = z.object({
  firstname: z.string().min(1, "Ten bat buoc phai co"),
  lastname: z.string().min(1, "Ho bat buoc phai co"),
  username: z.string().min(3, "Ten dang nhap phai it nhat 3 ky tu"),
  email: z.email("email khong hop le"),
  password: z.string().min(6, "Mat khau phai it nhat 6 ky tu"),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;
export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { signUp } = useAuthStore();
  const navigate = useNavigate();
  //useForm la hook giup lay du lieu input, kiem tra input co hop le, gui form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema), // ket noi useForm voi schema
  });

  //nhan tat ca du lieu input nguoi dung nhap
  const onSubmit = async (data: SignUpFormValues) => {
    const { firstname, lastname, username, email, password } = data;
    await signUp(username, password, email, firstname, lastname);

    navigate("/signin");
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
                <h1 className="text-2xl font-bold">Tao tai khoan</h1>
                <p className="text-muted-foreground text-balance">
                  Hay dang ky de bat dau
                </p>
              </div>
              {/* ho va ten */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="lastname" className="block text-sm">
                    Ho
                  </Label>
                  <Input type="text" id="lastname" {...register("lastname")} />

                  {errors.lastname && (
                    <p className="error-message">{errors.lastname.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firstname" className="block text-sm">
                    ten
                  </Label>
                  <Input
                    type="text"
                    id="firstname"
                    {...register("firstname")}
                  />
                  {errors.firstname && (
                    <p className="error-message">{errors.firstname.message}</p>
                  )}
                </div>
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
                  <p className="error-message">{errors.username.message}</p>
                )}
              </div>

              {/* email */}
              <div className="flex flex-col gap-3 ">
                <Label htmlFor="email" className="block text-sm">
                  email
                </Label>
                <Input
                  type="email"
                  id="email"
                  placeholder="email"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="error-message">{errors.email.message}</p>
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
                  <p className="error-message">{errors.password.message}</p>
                )}
              </div>
              {/* btn signup */}
              <Button
                type="submit"
                className="w-full cursor-pointer"
                disabled={isSubmitting}
              >
                Dang ky
              </Button>
              <div className="text-center text-sm">
                da co tai khoan?{" "}
                <a href="/signin" className="underline underline-offset-4">
                  Dang nhap
                </a>
              </div>
            </div>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="/placeholderSignUp.png"
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
