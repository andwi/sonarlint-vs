using System;
using System.Threading;

namespace Tests.TestCases
{
    abstract class BaseAbstract
    {
        public abstract void M3(int a); //okay
    }
    class Base
    {
        public virtual void M3(int a) //okay
        {
        }
    }
    interface IMy
    {
        void M4(int a);
    }

    class MethodParameterUnused : Base, IMy
    {
        public event EventHandler MyEvent;

        public MethodParameterUnused()
        {
            // AddAssignmentExpression
            MyEvent += MethodParameterUnused_MyEvent;

            // VariableDeclarator
            WaitCallback c = W1;

            // SimpleAssignmentExpression
            c = W2;

            // Argument
            ThreadPool.QueueUserWorkItem(W3);

            // InvocationExpression
            W4(null);
        }

        public void M1(int a) //Noncompliant
        {
        }

        public void M1okay(int a)
        {
            Console.Write(a);
        }

        public virtual void M2(int a)
        {
        }

        public override void M3(int a) //okay
        {
        }

        public void M4(int a) //okay
        { }

        private void MethodParameterUnused_MyEvent(object sender, EventArgs e)
        {
        }

        static void W1(object state)
        {
        }

        static void W2(object state)
        {
        }

        static void W3(object state)
        {
        }

        static void W4(object state) //Noncompliant
        {
        }
    }
}
