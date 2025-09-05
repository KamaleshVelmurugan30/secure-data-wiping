// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useAuth } from "@/providers/auth";
// import { toast } from "sonner";

// const schema = z.object({
//   email: z.string().email(),
//   password: z.string().min(6),
// });
// type FormValues = z.infer<typeof schema>;

// export default function Login() {
//   const { login } = useAuth();
//   const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm<FormValues>({ resolver: zodResolver(schema) });

//   const onSubmit = async (values: FormValues) => {
//     try {
//       await login(values.email, values.password);
//       toast.success("Logged in");
//     } catch {
//       toast.error("Invalid email or password");
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center px-4">
//       <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm space-y-4 p-6 rounded-lg border bg-card shadow-secure">
//         <h1 className="text-2xl font-semibold">Sign in</h1>
//         <div className="space-y-1">
//           <label className="text-sm font-medium">Email</label>
//           <input className="w-full rounded-md border px-3 py-2 bg-background" type="email" {...register("email")} />
//           {errors.email && <p className="text-sm text-destructive">Enter a valid email</p>}
//         </div>
//         <div className="space-y-1">
//           <label className="text-sm font-medium">Password</label>
//           <input className="w-full rounded-md border px-3 py-2 bg-background" type="password" {...register("password")} />
//           {errors.password && <p className="text-sm text-destructive">Min 6 characters</p>}
//         </div>
//         <button type="submit" disabled={isSubmitting} className="w-full h-10 rounded-md bg-primary text-primary-foreground transition-secure hover:shadow-glow">
//           {isSubmitting ? "Signing in..." : "Sign in"}
//         </button>
//       </form>
//     </div>
//   );
// }
