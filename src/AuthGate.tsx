import { useEffect, useState, type ReactNode } from 'react';
import { confirmResetPassword, confirmSignUp, getCurrentUser, resetPassword, signIn, signOut, signUp } from 'aws-amplify/auth';
import { Dumbbell, LockKeyhole, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

type Mode='signin'|'signup'|'confirm'|'forgot'|'reset';

export default function AuthGate({children}:{children:(ctx:{user:any;logout:()=>Promise<void>})=>ReactNode}){
  const [user,setUser]=useState<any>(null);const [checking,setChecking]=useState(true);const [mode,setMode]=useState<Mode>('signin');
  const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [code,setCode]=useState('');const [error,setError]=useState('');const [busy,setBusy]=useState(false);
  useEffect(()=>{getCurrentUser().then(setUser).catch(()=>{}).finally(()=>setChecking(false))},[]);
  const run=async(fn:()=>Promise<void>)=>{setBusy(true);setError('');try{await fn()}catch(e:any){setError(e?.message||'Something went wrong.')}finally{setBusy(false)}};
  const submit=()=>run(async()=>{
    if(mode==='signin'){
      const r=await signIn({username:email.trim(),password}); if(r.isSignedIn)setUser(await getCurrentUser()); else if(r.nextStep?.signInStep==='CONFIRM_SIGN_UP')setMode('confirm');
    }else if(mode==='signup'){
      const r=await signUp({username:email.trim(),password,options:{userAttributes:{email:email.trim()}}});
      if(r.nextStep?.signUpStep==='CONFIRM_SIGN_UP')setMode('confirm');
    }else if(mode==='confirm'){
      await confirmSignUp({username:email.trim(),confirmationCode:code.trim()});setMode('signin');setCode('');setError('Account verified. Sign in to continue.');
    }else if(mode==='forgot'){
      await resetPassword({username:email.trim()});setMode('reset');
    }else if(mode==='reset'){
      await confirmResetPassword({username:email.trim(),confirmationCode:code.trim(),newPassword:password});setMode('signin');setCode('');
    }
  });
  const logout=async()=>{await signOut();setUser(null);setMode('signin');};
  if(checking)return <div className="auth-loading"><div className="pulse-logo"><Dumbbell/></div><strong>Loading JayFit…</strong></div>;
  if(user)return <>{children({user,logout})}</>;
  return <main className="auth-page"><section className="auth-brand"><div className="auth-mark"><Dumbbell/></div><div><span>JAYFIT</span><h1>Train with intent.<br/>Track every win.</h1><p>Your private workout log, recovery plan, and progression coach.</p></div></section>
    <section className="auth-card"><div className="auth-heading"><ShieldCheck/><div><strong>{mode==='signin'?'Welcome back':mode==='signup'?'Create your account':mode==='confirm'?'Verify your email':mode==='forgot'?'Reset password':'Choose a new password'}</strong><p>{mode==='signin'?'Your training history is waiting.':mode==='signup'?'Your data stays tied to your account.':mode==='confirm'?'Enter the code sent to your email.':mode==='forgot'?'We will send a reset code.':'Enter the code and your new password.'}</p></div></div>
      <label><Mail/><input autoCapitalize="none" autoComplete="email" inputMode="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/></label>
      {(mode==='signin'||mode==='signup'||mode==='reset')&&<label><LockKeyhole/><input type="password" autoComplete={mode==='signin'?'current-password':'new-password'} placeholder={mode==='reset'?'New password':'Password'} value={password} onChange={e=>setPassword(e.target.value)}/></label>}
      {(mode==='confirm'||mode==='reset')&&<label><ShieldCheck/><input inputMode="numeric" placeholder="Verification code" value={code} onChange={e=>setCode(e.target.value)}/></label>}
      {error&&<div className={error.startsWith('Account verified')?'auth-success':'auth-error'}>{error}</div>}
      <button className="auth-primary" disabled={busy||!email||(mode!=='forgot'&&mode!=='confirm'&&!password)||(mode==='confirm'&&!code)||(mode==='reset'&&!code)} onClick={submit}>{busy?'Working…':mode==='signin'?'SIGN IN':mode==='signup'?'CREATE ACCOUNT':mode==='confirm'?'VERIFY EMAIL':mode==='forgot'?'SEND RESET CODE':'SET NEW PASSWORD'}<ArrowRight/></button>
      <div className="auth-links">
        {mode==='signin'&&<><button onClick={()=>{setMode('forgot');setError('')}}>Forgot password?</button><button onClick={()=>{setMode('signup');setError('')}}>Create account</button></>}
        {mode!=='signin'&&<button onClick={()=>{setMode('signin');setError('')}}>Back to sign in</button>}
      </div>
    </section><p className="auth-foot">JayFit uses AWS Cognito authentication. Workout data is private to the signed-in account.</p></main>;
}
